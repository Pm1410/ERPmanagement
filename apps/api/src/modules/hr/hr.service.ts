import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  ApplyLeaveDto, ApproveLeaveDto, SetPayrollConfigDto, RunPayrollDto,
} from './dto/hr.dto';

@Injectable()
export class HrService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('payroll-run') private readonly payrollQueue: Queue,
  ) {}

  // ── Staff Leaves ───────────────────────────────────────────
  async applyLeave(dto: ApplyLeaveDto, staffUserId: string, institutionId: string) {
    const from = new Date(dto.fromDate);
    const to = new Date(dto.toDate);
    if (to < from) throw new BadRequestException('End date must be after start date');

    const days = Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1;

    return this.prisma.staffLeave.create({
      data: {
        staffUserId,
        institutionId,
        leaveType: dto.leaveType,
        fromDate: from,
        toDate: to,
        days,
        reason: dto.reason,
        substituteId: dto.substituteId,
        status: 'PENDING',
      },
    });
  }

  async getLeaves(query: { staffUserId?: string; status?: string; institutionId: string }) {
    const where: Record<string, unknown> = { institutionId: query.institutionId };
    if (query.staffUserId) where.staffUserId = query.staffUserId;
    if (query.status) where.status = query.status;
    return this.prisma.staffLeave.findMany({
      where,
      include: {
        staff: { select: { name: true } },
        substitute: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveLeave(leaveId: string, dto: ApproveLeaveDto, approverId: string) {
    const leave = await this.prisma.staffLeave.findUnique({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException('Leave request not found');
    if (leave.status !== 'PENDING') throw new BadRequestException('Leave is already processed');

    return this.prisma.staffLeave.update({
      where: { id: leaveId },
      data: { status: dto.status, approverId, approverRemarks: dto.remarks, updatedAt: new Date() },
    });
  }

  async getLeaveBalance(staffUserId: string) {
    const year = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const taken = await this.prisma.staffLeave.groupBy({
      by: ['leaveType'],
      where: { staffUserId, status: 'APPROVED', fromDate: { gte: start, lt: end } },
      _sum: { days: true },
    });

    const ENTITLEMENTS: Record<string, number> = { CL: 12, EL: 21, ML: 15, LWP: 999, SPECIAL: 5 };
    return Object.entries(ENTITLEMENTS).map(([type, entitled]) => {
      const used = taken.find((t) => t.leaveType === type)?._sum.days ?? 0;
      return { leaveType: type, entitled, used, remaining: Math.max(0, entitled - used) };
    });
  }

  // ── Payroll ────────────────────────────────────────────────
  async setPayrollConfig(dto: SetPayrollConfigDto, institutionId: string) {
    const payload = { ...dto, additionalComponents: dto.additionalComponents as any };
    return this.prisma.payrollConfig.upsert({
      where: { staffId: dto.staffId },
      update: { ...payload, institutionId, updatedAt: new Date() },
      create: { ...payload, institutionId },
    });
  }

  async getPayrollConfig(staffId: string) {
    const config = await this.prisma.payrollConfig.findUnique({ where: { staffId } });
    if (!config) throw new NotFoundException('Payroll config not found');
    return config;
  }

  async runPayroll(dto: RunPayrollDto, institutionId: string) {
    // Enqueue BullMQ job — heavy computation done async
    const job = await this.payrollQueue.add(
      'process',
      { month: dto.month, year: dto.year, staffIds: dto.staffIds, institutionId },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    return { message: 'Payroll run queued', jobId: job.id };
  }

  async getPayslips(query: { staffId?: string; month?: number; year?: number }, institutionId: string) {
    const where: Record<string, unknown> = { institutionId };
    if (query.staffId) where.staffId = query.staffId;
    if (query.month) where.month = query.month;
    if (query.year) where.year = query.year;
    return this.prisma.payslip.findMany({
      where,
      include: { staff: { select: { name: true, email: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getPayslipById(id: string, institutionId: string) {
    const slip = await this.prisma.payslip.findFirst({ where: { id, institutionId } });
    if (!slip) throw new NotFoundException('Payslip not found');
    return slip;
  }

  // ── Holiday Calendar ───────────────────────────────────────
  async getHolidays(institutionId: string, year?: number) {
    const where: Record<string, unknown> = { institutionId };
    if (year) {
      where.date = {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };
    }
    return this.prisma.holiday.findMany({ where, orderBy: { date: 'asc' } });
  }

  async addHoliday(data: { name: string; date: string; type: string }, institutionId: string) {
    return this.prisma.holiday.create({
      data: { name: data.name, date: new Date(data.date), type: data.type, institutionId },
    });
  }

  async deleteHoliday(id: string, institutionId: string) {
    const h = await this.prisma.holiday.findFirst({ where: { id, institutionId } });
    if (!h) throw new NotFoundException('Holiday not found');
    await this.prisma.holiday.delete({ where: { id } });
    return { message: 'Holiday removed' };
  }
}
