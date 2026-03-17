import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  SendNotificationDto, BulkNotificationDto, NotificationChannel, NotificationTemplate,
} from './dto/notification.dto';
import { renderTemplate, renderSms } from './templates/email.templates';

export interface QueuedNotification {
  channel: NotificationChannel;
  template: string;
  recipient: string;           // email, phone, or FCM token
  variables: Record<string, string>;
  institutionId?: string;
  userId?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue('notification-queue') private readonly queue: Queue,
  ) {}

  // ── Public API ─────────────────────────────────────────────

  /** Send to a single recipient across specified channels */
  async send(dto: SendNotificationDto): Promise<{ queued: number }> {
    let queued = 0;
    for (const channel of dto.channels) {
      await this.enqueue({
        channel,
        template: dto.template,
        recipient: dto.recipient,
        variables: { ...dto.variables, year: new Date().getFullYear().toString() },
        institutionId: dto.institutionId,
      });
      queued++;
    }
    return { queued };
  }

  /** Resolve recipients from classId / sectionId / explicit list / allStudents / allFaculty */
  async sendBulk(dto: BulkNotificationDto, institutionId: string): Promise<{ queued: number }> {
    const recipients = await this.resolveRecipients(dto, institutionId);
    let queued = 0;

    for (const r of recipients) {
      for (const channel of dto.channels) {
        const target = channel === NotificationChannel.EMAIL ? r.email
          : channel === NotificationChannel.SMS ? r.phone
          : r.fcmToken;

        if (!target) continue;

        await this.enqueue({
          channel,
          template: dto.template,
          recipient: target,
          variables: {
            ...dto.variables,
            recipientName: r.name,
            year: new Date().getFullYear().toString(),
          },
          institutionId,
          userId: r.userId,
        });
        queued++;
      }
    }

    this.logger.log(`Bulk notification: ${queued} jobs queued for ${recipients.length} recipients`);
    return { queued };
  }

  /** Used by other services (attendance, fee, etc.) to fire notifications */
  async fireEvent(
    template: NotificationTemplate,
    channels: NotificationChannel[],
    recipient: string,
    variables: Record<string, string>,
    institutionId?: string,
  ) {
    for (const channel of channels) {
      await this.enqueue({ channel, template, recipient, variables, institutionId }).catch(() => null);
    }
  }

  async getDeliveryStats(institutionId: string) {
    const [total, sent, failed, pending] = await Promise.all([
      this.prisma.notificationLog.count({ where: { institutionId } }),
      this.prisma.notificationLog.count({ where: { institutionId, status: 'SENT' } }),
      this.prisma.notificationLog.count({ where: { institutionId, status: 'FAILED' } }),
      this.prisma.notificationLog.count({ where: { institutionId, status: 'PENDING' } }),
    ]);

    const byChannel = await this.prisma.notificationLog.groupBy({
      by: ['channel'],
      where: { institutionId },
      _count: true,
    });

    return {
      total, sent, failed, pending,
      deliveryRate: total > 0 ? Math.round((sent / total) * 100) : 0,
      byChannel: byChannel.map((r) => ({ channel: r.channel, count: r._count })),
    };
  }

  async getLogs(institutionId: string, query: { channel?: string; status?: string; dateFrom?: string; dateTo?: string }) {
    const where: Record<string, unknown> = { institutionId };
    if (query.channel) where.channel = query.channel;
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }
    return this.prisma.notificationLog.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 200,
    });
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }

  // ── Internal helpers ───────────────────────────────────────
  private async enqueue(job: QueuedNotification) {
    const jobName = job.channel === NotificationChannel.EMAIL ? 'send-email'
      : job.channel === NotificationChannel.SMS ? 'send-sms'
      : job.channel === NotificationChannel.PUSH ? 'send-push'
      : 'send-in-app';

    await this.queue.add(jobName, job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 500 },
    });
  }

  // ── In-App Notifications ──────────────────────────────────
  async getInAppNotifications(userId: string) {
    return this.prisma.inAppNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markInAppRead(id: string, userId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllInAppRead(userId: string) {
    return this.prisma.inAppNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  private async resolveRecipients(
    dto: BulkNotificationDto,
    institutionId: string,
  ): Promise<Array<{ email?: string; phone?: string; fcmToken?: string; name: string; userId?: string }>> {
    const results: Array<{ email?: string; phone?: string; fcmToken?: string; name: string; userId?: string }> = [];

    if (dto.allStudents || dto.classId || dto.sectionId) {
      const where: Record<string, unknown> = { institutionId, isActive: true, deletedAt: null };
      if (dto.classId) where.classId = dto.classId;
      if (dto.sectionId) where.sectionId = dto.sectionId;

      const students = await this.prisma.student.findMany({
        where,
        select: { name: true, email: true, fatherPhone: true, parentEmail: true, userId: true },
      });

      for (const s of students) {
        // Channels: student email + parent email + parent phone
        if (s.email)       results.push({ email: s.email, name: s.name, userId: s.userId ?? undefined });
        if (s.parentEmail) results.push({ email: s.parentEmail, phone: s.fatherPhone ?? undefined, name: `Parent of ${s.name}` });
      }
    }

    if (dto.allFaculty) {
      const faculty = await this.prisma.faculty.findMany({
        where: { institutionId, isActive: true, deletedAt: null },
        select: { name: true, email: true, phone: true, userId: true },
      });
      faculty.forEach((f) => results.push({ email: f.email, phone: f.phone ?? undefined, name: f.name, userId: f.userId ?? undefined }));
    }

    if (dto.allParents) {
      const students = await this.prisma.student.findMany({
        where: { institutionId, isActive: true, deletedAt: null },
        select: { name: true, parentEmail: true, fatherPhone: true },
      });
      students
        .filter((s) => s.parentEmail)
        .forEach((s) => results.push({ email: s.parentEmail!, phone: s.fatherPhone ?? undefined, name: `Parent of ${s.name}` }));
    }

    if (dto.recipientIds?.length) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: dto.recipientIds } },
        select: { id: true, name: true, email: true, phone: true },
      });
      users.forEach((u) => results.push({ email: u.email, phone: u.phone ?? undefined, name: u.name, userId: u.id }));
    }

    return results;
  }
}
