import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { TestEmailDto, TestSmsDto, UpdateInstitutionDto, UpdateMyProfileDto } from './dto/settings.dto';
import { NotificationChannel, NotificationTemplate } from '../notification/dto/notification.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationService,
  ) {}

  async getInstitutionSettings(institutionId: string) {
    const inst = await this.prisma.institution.findFirst({ where: { id: institutionId } });
    if (!inst) throw new NotFoundException('Institution not found');
    return inst;
  }

  async updateInstitutionSettings(institutionId: string, dto: UpdateInstitutionDto) {
    const inst = await this.prisma.institution.findFirst({ where: { id: institutionId } });
    if (!inst) throw new NotFoundException('Institution not found');
    return this.prisma.institution.update({ where: { id: institutionId }, data: { ...dto } });
  }

  async getSecuritySettings() {
    return {
      rateLimit: {
        windowMs: Number(this.config.get('RATE_LIMIT_WINDOW_MS', 900000)),
        max: Number(this.config.get('RATE_LIMIT_MAX', 100)),
      },
      jwt: {
        accessTtl: this.config.get('JWT_EXPIRES_IN', '15m'),
        refreshTtl: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    };
  }

  async getNotificationStatus(institutionId: string) {
    const sendgridKey = this.config.get('SENDGRID_API_KEY');
    const smtpHost = this.config.get('SMTP_HOST');
    const twilioSid = this.config.get('TWILIO_ACCOUNT_SID');
    const msg91 = this.config.get('MSG91_AUTH_KEY');

    const queue = await this.notifications.getQueueStats().catch(() => null);
    const delivery = await this.notifications.getDeliveryStats(institutionId).catch(() => null);

    return {
      emailProvider: sendgridKey && sendgridKey !== 'SG.xxxx' ? 'SENDGRID' : smtpHost ? 'SMTP' : 'MAILHOG',
      smsProvider: twilioSid && twilioSid !== 'ACxxxx' ? 'TWILIO' : msg91 ? 'MSG91' : 'NONE',
      pushProvider: this.config.get('FIREBASE_PROJECT_ID') ? 'FCM' : 'NONE',
      queue,
      delivery,
    };
  }

  async testEmail(dto: TestEmailDto, institutionId: string) {
    await this.notifications.send({
      channels: [NotificationChannel.EMAIL],
      template: NotificationTemplate.BULK_NOTICE,
      recipient: dto.to,
      variables: {
        recipientName: 'Admin',
        subject: dto.subject ?? 'Test email',
        message: dto.message ?? 'This is a test email from School ERP settings.',
        institutionName: 'School ERP',
      },
      institutionId,
    });
    return { message: 'Email queued' };
  }

  async testSms(dto: TestSmsDto, institutionId: string) {
    await this.notifications.send({
      channels: [NotificationChannel.SMS],
      template: NotificationTemplate.BULK_NOTICE,
      recipient: dto.to,
      variables: {
        institutionName: 'School ERP',
        message: dto.message ?? 'Test SMS from School ERP settings.',
      },
      institutionId,
    });
    return { message: 'SMS queued' };
  }

  async getMyProfile(user: { id: string; role: string; institutionId: string }) {
    const u = await this.prisma.user.findFirst({
      where: { id: user.id, institutionId: user.institutionId, deletedAt: null },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: { select: { name: true } } },
    });
    if (!u) throw new NotFoundException('User not found');

    // Attach role-specific profile fragment
    let profile: any = null;
    if (user.role === 'STUDENT') {
      profile = await this.prisma.student.findFirst({ where: { userId: user.id, institutionId: user.institutionId, deletedAt: null }, select: { id: true, address: true } });
    } else if (user.role === 'FACULTY' || user.role === 'HOD') {
      profile = await this.prisma.faculty.findFirst({ where: { userId: user.id, institutionId: user.institutionId, deletedAt: null }, select: { id: true, address: true } });
    } else if (user.role === 'PARENT') {
      profile = await this.prisma.parent.findFirst({ where: { userId: user.id, institutionId: user.institutionId, deletedAt: null }, select: { id: true, phone: true } });
    }

    return { ...u, role: u.role.name, profile };
  }

  async updateMyProfile(user: { id: string; role: string; institutionId: string }, dto: UpdateMyProfileDto) {
    const u = await this.prisma.user.findFirst({ where: { id: user.id, institutionId: user.institutionId, deletedAt: null } });
    if (!u) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
        ...(dto.avatar !== undefined ? { avatar: dto.avatar } : {}),
      },
    });

    // Update role-specific address if present
    if (dto.address !== undefined) {
      if (user.role === 'STUDENT') {
        await this.prisma.student.updateMany({ where: { userId: user.id, institutionId: user.institutionId }, data: { address: dto.address } });
      } else if (user.role === 'FACULTY' || user.role === 'HOD') {
        await this.prisma.faculty.updateMany({ where: { userId: user.id, institutionId: user.institutionId }, data: { address: dto.address } });
      } else if (user.role === 'PARENT') {
        // parent address not modeled; ignore for now
      }
    }

    return this.getMyProfile(user);
  }

  assertAdmin(role: string) {
    const ok = ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL'].includes(role);
    if (!ok) throw new ForbiddenException('Admin access required');
  }
}

