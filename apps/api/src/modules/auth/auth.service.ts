import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { generateOtp } from '../../common/utils/crypto.util';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role.name, user.institutionId);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        avatar: user.avatar,
        institutionId: user.institutionId,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string; role: string; institutionId?: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.redis.getRefreshToken(payload.sub);
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const tokens = await this.generateTokens(payload.sub, payload.email, payload.role, payload.institutionId);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async logout(userId: string) {
    await this.redis.deleteRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If that email exists, an OTP has been sent' };

    const otp = generateOtp(6);
    await this.redis.setOtp(dto.email, otp);

    // TODO: integrate SendGrid/Twilio here
    // await this.mailService.sendOtp(dto.email, otp);
    console.log(`[DEV] OTP for ${dto.email}: ${otp}`);

    return { message: 'If that email exists, an OTP has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const storedOtp = await this.redis.getOtp(dto.email);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User not found');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    await this.redis.deleteOtp(dto.email);
    await this.redis.deleteRefreshToken(user.id);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    await this.redis.deleteRefreshToken(userId);

    return { message: 'Password changed successfully' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    institutionId?: string | null,
  ) {
    const payload = { sub: userId, email, role, institutionId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redis.setRefreshToken(userId, refreshToken, ttl);

    return { accessToken, refreshToken };
  }
}
