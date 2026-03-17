import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationChannel, NotificationTemplate } from '../dto/notification.dto';

const mockPrisma = {
  notificationLog: {
    count: jest.fn(),
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
  student: { findMany: jest.fn() },
  faculty: { findMany: jest.fn() },
  user: { findMany: jest.fn() },
};

const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'notif-job-1' }),
  getWaitingCount: jest.fn().mockResolvedValue(0),
  getActiveCount: jest.fn().mockResolvedValue(0),
  getCompletedCount: jest.fn().mockResolvedValue(100),
  getFailedCount: jest.fn().mockResolvedValue(2),
  getDelayedCount: jest.fn().mockResolvedValue(0),
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
        { provide: getQueueToken('notification-queue'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('enqueues one job per channel', async () => {
      const result = await service.send({
        channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
        template: NotificationTemplate.FEE_DUE,
        recipient: 'parent@example.com',
        variables: { studentName: 'Arjun', amount: '5000', dueDate: '2024-12-31', feeHead: 'Tuition' },
      });

      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(result.queued).toBe(2);
    });

    it('enqueues with correct job names', async () => {
      await service.send({
        channels: [NotificationChannel.EMAIL],
        template: NotificationTemplate.ATTENDANCE_ABSENT,
        recipient: 'parent@test.com',
        variables: { studentName: 'Priya', date: '2024-09-01', className: '10A', parentName: 'Parent' },
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({ channel: 'EMAIL', template: 'ATTENDANCE_ABSENT' }),
        expect.any(Object),
      );
    });

    it('routes PUSH to send-push job', async () => {
      await service.send({
        channels: [NotificationChannel.PUSH],
        template: NotificationTemplate.NEW_NOTICE,
        recipient: 'fcm_token_here',
        variables: { noticeTitle: 'Test', noticeBody: 'Body', authorName: 'Admin' },
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-push',
        expect.objectContaining({ channel: 'PUSH' }),
        expect.any(Object),
      );
    });
  });

  describe('sendBulk', () => {
    it('resolves allStudents recipients and queues per channel', async () => {
      mockPrisma.student.findMany.mockResolvedValue([
        { name: 'Arjun', email: 'arjun@school.in', fatherPhone: '+919876543210', parentEmail: 'dad@gmail.com', userId: 'u1' },
        { name: 'Priya', email: 'priya@school.in', fatherPhone: '+919876543211', parentEmail: 'mom@gmail.com', userId: 'u2' },
      ]);

      const result = await service.sendBulk({
        channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
        template: NotificationTemplate.BULK_NOTICE,
        allStudents: true,
        variables: { subject: 'School closed tomorrow', message: 'School will remain closed.' },
      }, 'inst-1');

      // 2 students × (student email + parent email = 2 emails each for EMAIL channel)
      // + parent phone (SMS channel for parent)
      expect(mockQueue.add).toHaveBeenCalled();
      expect(result.queued).toBeGreaterThan(0);
    });

    it('resolves explicit recipientIds', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u1', name: 'Faculty One', email: 'f1@school.in', phone: '+911234567890' },
      ]);

      await service.sendBulk({
        channels: [NotificationChannel.EMAIL],
        template: NotificationTemplate.NEW_NOTICE,
        recipientIds: ['u1'],
        variables: { noticeTitle: 'Test', noticeBody: 'Body', authorName: 'Admin' },
      }, 'inst-1');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: ['u1'] } } }),
      );
    });
  });

  describe('getDeliveryStats', () => {
    it('returns stats with correct delivery rate', async () => {
      mockPrisma.notificationLog.count
        .mockResolvedValueOnce(100)   // total
        .mockResolvedValueOnce(90)    // sent
        .mockResolvedValueOnce(5)     // failed
        .mockResolvedValueOnce(5);    // pending
      mockPrisma.notificationLog.groupBy.mockResolvedValue([
        { channel: 'EMAIL', _count: 60 },
        { channel: 'SMS', _count: 40 },
      ]);

      const result = await service.getDeliveryStats('inst-1');

      expect(result.total).toBe(100);
      expect(result.sent).toBe(90);
      expect(result.deliveryRate).toBe(90);
      expect(result.byChannel).toHaveLength(2);
    });
  });

  describe('getQueueStats', () => {
    it('returns queue depth from Bull', async () => {
      const stats = await service.getQueueStats();
      expect(stats).toHaveProperty('waiting');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
    });
  });
});
