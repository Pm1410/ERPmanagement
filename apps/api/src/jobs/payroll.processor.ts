import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';

interface PayrollJobData {
  month: number;
  year: number;
  institutionId: string;
  staffIds?: string[];
}

@Processor('payroll-run')
export class PayrollProcessor {
  private readonly logger = new Logger(PayrollProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('process')
  async handlePayrollRun(job: Job<PayrollJobData>) {
    const { month, year, institutionId, staffIds } = job.data;
    this.logger.log(`Processing payroll for ${month}/${year} institution=${institutionId}`);

    const where: Record<string, unknown> = { institutionId };
    if (staffIds?.length) where.id = { in: staffIds };

    const configs = await this.prisma.payrollConfig.findMany({
      where: { staff: { institutionId } } as any,
      include: { staff: true },
    });

    let processed = 0;
    for (const config of configs) {
      try {
        // Get attendance for the month to compute LOP (Loss of Pay)
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 1);
        const workingDays = this.calculateWorkingDays(monthStart, monthEnd);

        const leaves = await this.prisma.staffLeave.findMany({
          where: {
            staffUserId: config.staffId,
            status: 'APPROVED',
            leaveType: 'LWP',
            fromDate: { gte: monthStart, lt: monthEnd },
          },
        });
        const lopDays = leaves.reduce((s, l) => s + l.days, 0);

        // Compute earnings
        const basic = Number(config.basicSalary);
        const hra = Number(config.hra ?? basic * 0.4);
        const ta = Number(config.ta ?? 1600);
        const da = Number(config.da ?? 0);
        const grossEarnings = basic + hra + ta + da;

        // Deductions
        const pf = Number(config.pf ?? basic * 0.12);
        const esi = Number(config.esi ?? 0);
        const tds = Number(config.tds ?? 0);
        const pt = Number(config.professionalTax ?? 200);
        const lopDeduction = workingDays > 0 ? (grossEarnings / workingDays) * lopDays : 0;
        const totalDeductions = pf + esi + tds + pt + lopDeduction;

        const netSalary = Math.max(0, grossEarnings - totalDeductions);

        // Upsert payslip
        await this.prisma.payslip.upsert({
          where: { staffId_month_year: { staffId: config.staffId, month, year } },
          update: {
            grossEarnings, basicSalary: basic, hra, ta, da,
            pf, esi, tds, professionalTax: pt, lopDeduction, totalDeductions,
            netSalary, lopDays, workingDays, updatedAt: new Date(),
          },
          create: {
            staffId: config.staffId,
            institutionId,
            month, year,
            grossEarnings, basicSalary: basic, hra, ta, da,
            pf, esi, tds, professionalTax: pt, lopDeduction, totalDeductions,
            netSalary, lopDays, workingDays,
            status: 'GENERATED',
          },
        });

        processed++;
        await job.progress(Math.round((processed / configs.length) * 100));
      } catch (err) {
        this.logger.error(`Failed payslip for staff ${config.staffId}`, err);
      }
    }

    this.logger.log(`Payroll complete: ${processed}/${configs.length} slips generated`);
    return { processed, total: configs.length };
  }

  private calculateWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current < end) {
      const dow = current.getDay();
      if (dow !== 0 && dow !== 6) count++; // Mon–Fri
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}
