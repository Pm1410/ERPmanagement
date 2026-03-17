import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis(this.config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });
    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('error', (err) => this.logger.error('Redis error', err));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  /** Store refresh token for user */
  async setRefreshToken(userId: string, token: string, ttlSeconds: number) {
    await this.set(`refresh:${userId}`, token, ttlSeconds);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.get(`refresh:${userId}`);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await this.del(`refresh:${userId}`);
  }

  /** OTP management */
  async setOtp(email: string, otp: string): Promise<void> {
    await this.set(`otp:${email}`, otp, 600); // 10 min
  }

  async getOtp(email: string): Promise<string | null> {
    return this.get(`otp:${email}`);
  }

  async deleteOtp(email: string): Promise<void> {
    await this.del(`otp:${email}`);
  }
}
