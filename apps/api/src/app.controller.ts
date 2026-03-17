import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './common/prisma/prisma.service';
import { RedisService } from './common/redis/redis.service';
import { NotificationService } from './modules/notification/notification.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationService,
  ) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async health() {
    const [dbOk, redisOk] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.ping(),
    ]);
    const queueOk = await this.notifications.getQueueStats().then(() => true).catch(() => false);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbOk.status === 'fulfilled' ? 'up' : 'down',
        redis: redisOk.status === 'fulfilled' ? 'up' : 'down',
        queue: queueOk ? 'up' : 'down',
      },
    };
  }

  @Public()
  @Get('readyz')
  @ApiOperation({ summary: 'Readiness check (DB + Redis required)' })
  async readyz() {
    const [dbOk, redisOk] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.ping(),
    ]);

    const services = {
      database: dbOk.status === 'fulfilled' ? 'up' : 'down',
      redis: redisOk.status === 'fulfilled' ? 'up' : 'down',
    };

    if (services.database !== 'up' || services.redis !== 'up') {
      throw new ServiceUnavailableException({
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        services,
      });
    }

    return { status: 'ready', timestamp: new Date().toISOString(), services };
  }
}
