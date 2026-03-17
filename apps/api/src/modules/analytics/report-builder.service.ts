import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CustomReportDto, ReportEntity, ReportFormat, ScheduleReportDto } from './dto/analytics.dto';
import { paginationParams, paginated } from '../../common/utils/response.util';

// Allowed fields per entity (whitelist prevents arbitrary column exposure)
const ALLOWED_FIELDS: Record<ReportEntity, string[]> = {
  [ReportEntity.STUDENTS]: ['name', 'email', 'rollNumber', 'admissionNumber', 'gender', 'dateOfBirth', 'isActive', 'fatherName', 'fatherPhone', 'parentEmail'],
  [ReportEntity.FACULTY]: ['name', 'email', 'phone', 'department', 'designation', 'employmentType', 'experience', 'joiningDate', 'isActive'],
  [ReportEntity.FEES]: ['studentId', 'amount', 'paymentMode', 'status', 'receiptNumber', 'paidAt', 'referenceNumber'],
  [ReportEntity.ATTENDANCE]: ['studentId', 'date', 'status', 'subjectId', 'classId', 'sectionId', 'remarks'],
  [ReportEntity.EXAMS]: ['studentId', 'examId', 'subjectId', 'marksObtained', 'maxMarks', 'grade', 'isPassed'],
  [ReportEntity.LIBRARY]: ['bookId', 'studentId', 'issuedAt', 'dueDate', 'returnedAt', 'fine'],
};

const PRISMA_MODEL: Record<ReportEntity, string> = {
  [ReportEntity.STUDENTS]: 'student',
  [ReportEntity.FACULTY]: 'faculty',
  [ReportEntity.FEES]: 'feePayment',
  [ReportEntity.ATTENDANCE]: 'attendanceRecord',
  [ReportEntity.EXAMS]: 'grade',
  [ReportEntity.LIBRARY]: 'bookIssue',
};

@Injectable()
export class ReportBuilderService {
  private readonly logger = new Logger(ReportBuilderService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('export-queue') private readonly exportQueue: Queue,
  ) {}

  async runReport(dto: CustomReportDto, institutionId: string) {
    const allowed = ALLOWED_FIELDS[dto.entity];
    const invalid = dto.fields.filter((f) => !allowed.includes(f));
    if (invalid.length) {
      throw new BadRequestException(`Invalid fields for ${dto.entity}: ${invalid.join(', ')}`);
    }

    const { page, limit, skip } = paginationParams({ page: dto.page, limit: dto.limit });

    const where = this.buildWhere(dto, institutionId);
    const select = Object.fromEntries(dto.fields.map((f) => [f, true]));

    const model = (this.prisma as any)[PRISMA_MODEL[dto.entity]];
    const [data, total] = await Promise.all([
      model.findMany({ where, select, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      model.count({ where }),
    ]);

    if (dto.format && dto.format !== ReportFormat.JSON) {
      // Enqueue async export job
      const job = await this.exportQueue.add('export', {
        entity: dto.entity,
        fields: dto.fields,
        data,
        format: dto.format,
        institutionId,
      });
      return { queued: true, jobId: job.id, message: `Export job queued. Download will be emailed when ready.` };
    }

    return paginated(data, total, page, limit);
  }

  async scheduleReport(dto: ScheduleReportDto, createdById: string, institutionId: string) {
    const report = await this.prisma.scheduledReport.create({
      data: {
        name: dto.name,
        entity: dto.entity,
        fields: dto.fields,
        filters: JSON.stringify({
          dateFrom: dto.dateFrom, dateTo: dto.dateTo,
          classId: dto.classId, sectionId: dto.sectionId, status: dto.status,
        }),
        format: dto.format ?? ReportFormat.EXCEL,
        cronExpression: dto.cronExpression,
        emailRecipients: dto.emailRecipients,
        createdById,
        institutionId,
        isActive: true,
      },
    });
    return report;
  }

  async getScheduledReports(institutionId: string) {
    return this.prisma.scheduledReport.findMany({
      where: { institutionId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteScheduledReport(id: string, institutionId: string) {
    await this.prisma.scheduledReport.updateMany({
      where: { id, institutionId },
      data: { isActive: false },
    });
    return { message: 'Scheduled report disabled' };
  }

  async getExportHistory(institutionId: string) {
    return this.prisma.exportLog.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private buildWhere(dto: CustomReportDto, institutionId: string) {
    const where: Record<string, unknown> = { institutionId };

    if (dto.classId) where.classId = dto.classId;
    if (dto.sectionId) where.sectionId = dto.sectionId;
    if (dto.status) where.status = dto.status;

    if (dto.dateFrom || dto.dateTo) {
      const dateField = dto.entity === ReportEntity.FEES ? 'paidAt'
        : dto.entity === ReportEntity.ATTENDANCE ? 'date'
        : 'createdAt';
      where[dateField] = {
        ...(dto.dateFrom ? { gte: new Date(dto.dateFrom) } : {}),
        ...(dto.dateTo ? { lte: new Date(dto.dateTo) } : {}),
      };
    }

    return where;
  }
}
