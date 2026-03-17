import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNoticeDto, SendMessageDto } from './dto/notice.dto';

@Injectable()
export class NoticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: EventEmitter2,
  ) {}

  async createNotice(dto: CreateNoticeDto, authorId: string, institutionId: string) {
    const notice = await this.prisma.notice.create({
      data: {
        title: dto.title,
        body: dto.body,
        priority: dto.priority ?? 'NORMAL',
        category: dto.category ?? 'GENERAL',
        target: dto.target,
        classId: dto.classId,
        sectionId: dto.sectionId,
        authorId,
        institutionId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        isPublished: !dto.scheduledAt, // publish immediately if no schedule
      },
    });

    // Emit for Socket.IO broadcast
    this.emitter.emit('notice:new', { notice, institutionId });

    // Queue SMS/email if requested
    if (dto.sendSms || dto.sendEmail) {
      this.emitter.emit('notification:send', {
        noticeId: notice.id,
        channels: { sms: dto.sendSms, email: dto.sendEmail },
        target: dto.target,
        classId: dto.classId,
        sectionId: dto.sectionId,
        recipientIds: dto.recipientIds,
        institutionId,
      });
    }

    return notice;
  }

  async getNotices(query: { userId?: string; role?: string; classId?: string }, institutionId: string) {
    const where: Record<string, unknown> = { institutionId, isPublished: true, deletedAt: null };

    if (query.classId) {
      where.OR = [
        { target: 'ALL' },
        { target: 'CLASS', classId: query.classId },
        { target: 'FACULTY', ...(query.role === 'FACULTY' ? {} : { id: 'no-match' }) },
      ];
    }

    return this.prisma.notice.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: { author: { select: { name: true } } },
    });
  }

  async markRead(noticeId: string, userId: string) {
    return this.prisma.noticeRead.upsert({
      where: { noticeId_userId: { noticeId, userId } },
      update: { readAt: new Date() },
      create: { noticeId, userId, readAt: new Date() },
    });
  }

  async deleteNotice(id: string, institutionId: string) {
    const notice = await this.prisma.notice.findFirst({ where: { id, institutionId } });
    if (!notice) throw new NotFoundException('Notice not found');
    await this.prisma.notice.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Notice deleted' };
  }

  // ── Direct Messages ────────────────────────────────────────
  async sendMessage(dto: SendMessageDto, senderId: string, institutionId: string) {
    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId: dto.recipientId,
        body: dto.body,
        parentMessageId: dto.parentMessageId,
        institutionId,
      },
    });

    this.emitter.emit('message:received', { message });
    return message;
  }

  async getMessages(userId: string, otherUserId?: string) {
    const where: Record<string, unknown> = {
      OR: [{ senderId: userId }, { recipientId: userId }],
    };
    if (otherUserId) {
      where.OR = [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ];
    }
    return this.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { name: true, avatar: true } },
        recipient: { select: { name: true, avatar: true } },
      },
    });
  }

  async getThread(parentId: string) {
    return this.prisma.message.findMany({
      where: { OR: [{ id: parentId }, { parentMessageId: parentId }] },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { name: true, avatar: true } } },
    });
  }

  async bulkNotify(body: {
    target: string; classId?: string; sectionId?: string;
    message: string; channels: { sms?: boolean; email?: boolean };
  }, institutionId: string) {
    this.emitter.emit('notification:bulk', { ...body, institutionId });
    return { message: 'Bulk notification queued' };
  }
}
