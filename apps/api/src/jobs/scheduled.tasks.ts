import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ScheduledTasks {
  private readonly logger = new Logger(ScheduledTasks.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notification-queue') private readonly notifQueue: Queue,
  ) {}

  /** Daily at 8 AM: notify parents of absent students from previous day */
  @Cron('0 8 * * *', { name: 'attendance-alert' })
  async sendAttendanceAlerts() {
    this.logger.log('[CRON] Running attendance alerts');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const absentRecords = await this.prisma.attendanceRecord.findMany({
      where: { status: 'ABSENT', date: { gte: yesterday, lte: yesterdayEnd } },
      include: { student: { select: { name: true, parentEmail: true, fatherPhone: true } } },
      distinct: ['studentId'],
    });

    for (const record of absentRecords) {
      const { student } = record;
      if (student.parentEmail) {
        await this.notifQueue.add('send-email', {
          type: 'EMAIL',
          to: student.parentEmail,
          subject: 'Attendance Alert',
          body: `Dear Parent, ${student.name} was marked absent on ${yesterday.toDateString()}.`,
        });
      }
      if (student.fatherPhone) {
        await this.notifQueue.add('send-sms', {
          type: 'SMS',
          to: student.fatherPhone,
          body: `${student.name} was absent on ${yesterday.toDateString()}. Please contact the school.`,
        });
      }
    }

    this.logger.log(`[CRON] Attendance alerts queued for ${absentRecords.length} students`);
  }

  /** Every Monday at 9 AM: send fee reminders to defaulters */
  @Cron('0 9 * * 1', { name: 'fee-reminder' })
  async sendFeeReminders() {
    this.logger.log('[CRON] Running fee reminders');

    const students = await this.prisma.student.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true, parentEmail: true, fatherPhone: true },
    });

    let reminded = 0;
    for (const student of students) {
      const dues = await this.prisma.feePayment.findFirst({
        where: { studentId: student.id, status: 'PENDING' },
      });
      if (dues && student.parentEmail) {
        await this.notifQueue.add('send-email', {
          type: 'EMAIL',
          to: student.parentEmail,
          subject: 'Fee Payment Reminder',
          body: `Dear Parent, ${student.name} has an outstanding fee balance. Please pay at your earliest convenience.`,
        });
        reminded++;
      }
    }
    this.logger.log(`[CRON] Fee reminders sent to ${reminded} families`);
  }

  /** Every Sunday at 10 AM: alert about expiring documents (within 30 days) */
  @Cron('0 10 * * 0', { name: 'document-expiry' })
  async checkDocumentExpiry() {
    this.logger.log('[CRON] Checking document expiry');
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000);

    const expiring = await this.prisma.staffContract.findMany({
      where: { endDate: { lte: thirtyDaysFromNow, gte: new Date() } },
      include: { faculty: { select: { name: true, email: true } } },
    }).catch(() => []);

    for (const contract of expiring) {
      if (contract.faculty?.email) {
        await this.notifQueue.add('send-email', {
          type: 'EMAIL',
          to: contract.faculty.email,
          subject: 'Contract Expiry Notice',
          body: `Dear ${contract.faculty.name}, your contract expires on ${contract.endDate.toDateString()}.`,
        });
      }
    }
    this.logger.log(`[CRON] Document expiry alerts sent for ${expiring.length} contracts`);
  }
}
