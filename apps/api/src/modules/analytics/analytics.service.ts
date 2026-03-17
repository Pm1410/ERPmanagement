import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SubjectPerformanceDto, LibraryUtilizationDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('export-queue') private readonly exportQueue: Queue,
  ) {}

  async getDashboardKpis(institutionId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [totalStudents, totalFaculty, totalStaff, pendingAdmissions,
      openGrievances, monthlyFeeCollection, todayAttendance] = await Promise.all([
      this.prisma.student.count({ where: { institutionId, isActive: true, deletedAt: null } }),
      this.prisma.faculty.count({ where: { institutionId, isActive: true, deletedAt: null } }),
      this.prisma.user.count({ where: { institutionId, isActive: true } }),
      this.prisma.admissionApplication.count({ where: { institutionId, status: 'PENDING' } }).catch(() => 0),
      this.prisma.grievance.count({ where: { institutionId, status: 'OPEN' } }),
      this.prisma.feePayment.aggregate({
        where: { institutionId, status: 'SUCCESS', paidAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: { date: { gte: todayStart } },
        _count: true,
      }),
    ]);

    const attendanceMap = Object.fromEntries(todayAttendance.map((r) => [r.status, r._count]));
    const totalMarked = Object.values(attendanceMap).reduce((s: number, v) => s + (v as number), 0);
    const presentCount = (attendanceMap['PRESENT'] ?? 0) as number;

    return {
      totalStudents, totalFaculty, totalStaff, pendingAdmissions, openGrievances,
      monthlyFeeCollection: Number(monthlyFeeCollection._sum.amount ?? 0),
      todayAttendancePct: totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : null,
    };
  }

  async getAttendanceTrends(institutionId: string, classId?: string, range: 'WEEK' | 'MONTH' | 'YEAR' = 'MONTH') {
    const now = new Date();
    const startDate = range === 'WEEK' ? new Date(now.getTime() - 7 * 86400000)
      : range === 'YEAR' ? new Date(now.getFullYear(), 0, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1);

    const where: Record<string, unknown> = { date: { gte: startDate } };
    if (classId) where.classId = classId;

    const records = await this.prisma.attendanceRecord.groupBy({
      by: ['date', 'status'], where, _count: true, orderBy: { date: 'asc' },
    });

    const byDate: Record<string, Record<string, number>> = {};
    records.forEach((r) => {
      const d = r.date.toISOString().split('T')[0];
      if (!byDate[d]) byDate[d] = {};
      byDate[d][r.status] = r._count;
    });

    return Object.entries(byDate).map(([date, counts]) => ({
      date,
      present: counts['PRESENT'] ?? 0,
      absent: counts['ABSENT'] ?? 0,
      late: counts['LATE'] ?? 0,
      leave: counts['LEAVE'] ?? 0,
    }));
  }

  async getExamPerformance(institutionId: string, classId?: string, examId?: string) {
    const where: Record<string, unknown> = {};
    if (classId) where.classId = classId;
    if (examId) where.examId = examId;

    const grades = await this.prisma.grade.findMany({
      where, select: { grade: true, marksObtained: true, maxMarks: true, subjectId: true, isPassed: true },
    });

    if (!grades.length) return { gradeDistribution: [], averageScore: 0, passRate: 0, totalStudentsGraded: 0 };

    const totalMarks = grades.reduce((s, g) => s + Number(g.marksObtained), 0);
    const totalMax = grades.reduce((s, g) => s + g.maxMarks, 0);
    const passCount = grades.filter((g) => g.isPassed).length;
    const gradeCount: Record<string, number> = {};
    grades.forEach((g) => { if (g.grade) gradeCount[g.grade] = (gradeCount[g.grade] ?? 0) + 1; });

    return {
      averageScore: totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0,
      passRate: Math.round((passCount / grades.length) * 100),
      gradeDistribution: Object.entries(gradeCount).map(([grade, count]) => ({ grade, count })),
      totalStudentsGraded: grades.length,
    };
  }

  async getFeeCollectionStats(institutionId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    return Promise.all(
      Array.from({ length: 12 }, (_, i) => ({ month: i + 1, start: new Date(y, i, 1), end: new Date(y, i + 1, 1) }))
        .map(async ({ month, start, end }) => {
          const agg = await this.prisma.feePayment.aggregate({
            where: { institutionId, status: 'SUCCESS', paidAt: { gte: start, lt: end } },
            _sum: { amount: true }, _count: true,
          });
          return { month, amount: Number(agg._sum.amount ?? 0), transactions: agg._count };
        }),
    );
  }

  async getAdmissionsFunnel(institutionId: string, academicYear?: string) {
    const where: Record<string, unknown> = { institutionId };
    const [enquiries, applications, enrolled] = await Promise.all([
      this.prisma.admissionEnquiry.count({ where }).catch(() => 0),
      this.prisma.admissionApplication.count({ where }).catch(() => 0),
      this.prisma.student.count({ where: { institutionId, deletedAt: null } }),
    ]);
    return { enquiries, applications, enrolled, conversionRate: enquiries > 0 ? Math.round((enrolled / enquiries) * 100) : 0 };
  }

  async getAtRiskStudents(institutionId: string, attendanceThreshold = 75, marksThreshold = 40) {
    const students = await this.prisma.student.findMany({
      where: { institutionId, isActive: true, deletedAt: null },
      select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
    });

    const atRisk: unknown[] = [];
    for (const student of students) {
      const [attendanceRecords, grades] = await Promise.all([
        this.prisma.attendanceRecord.findMany({ where: { studentId: student.id } }),
        this.prisma.grade.findMany({ where: { studentId: student.id } }),
      ]);
      const present = attendanceRecords.filter((r) => ['PRESENT', 'LATE'].includes(r.status)).length;
      const attendancePct = attendanceRecords.length > 0 ? Math.round((present / attendanceRecords.length) * 100) : 100;
      const avgMarks = grades.length > 0
        ? grades.reduce((s, g) => s + (Number(g.marksObtained) / (g.maxMarks ?? 100)) * 100, 0) / grades.length
        : 100;
      if (attendancePct < attendanceThreshold || avgMarks < marksThreshold) {
        atRisk.push({ ...student, attendancePct, avgMarks: Math.round(avgMarks) });
      }
    }
    return atRisk;
  }

  // ── NEW: Subject-wise performance ──────────────────────────
  async getSubjectPerformance(institutionId: string, dto: SubjectPerformanceDto) {
    const where: Record<string, unknown> = {};
    if (dto.classId) where.classId = dto.classId;
    if (dto.sectionId) where.sectionId = dto.sectionId;
    if (dto.examId) where.examId = dto.examId;

    const subjects = await this.prisma.subject.findMany({
      where: { institutionId, deletedAt: null, ...(dto.classId ? { classId: dto.classId } : {}) },
      select: { id: true, name: true, code: true },
    });

    return Promise.all(subjects.map(async (sub) => {
      const agg = await this.prisma.grade.aggregate({
        where: { ...where, subjectId: sub.id },
        _avg: { marksObtained: true }, _max: { marksObtained: true },
        _min: { marksObtained: true }, _count: true,
      });
      const passCount = await this.prisma.grade.count({ where: { ...where, subjectId: sub.id, isPassed: true } });
      return {
        subjectId: sub.id, subjectName: sub.name, code: sub.code,
        average: agg._avg.marksObtained ? Math.round(Number(agg._avg.marksObtained) * 10) / 10 : 0,
        highest: Number(agg._max.marksObtained ?? 0),
        lowest: Number(agg._min.marksObtained ?? 0),
        studentCount: agg._count,
        passRate: agg._count > 0 ? Math.round((passCount / agg._count) * 100) : 0,
      };
    }));
  }

  // ── NEW: Year-over-year fee comparison ─────────────────────
  async getYearOverYearFees(institutionId: string) {
    const y = new Date().getFullYear();
    const [current, previous] = await Promise.all([
      this.getFeeCollectionStats(institutionId, y),
      this.getFeeCollectionStats(institutionId, y - 1),
    ]);
    return {
      currentYear: y, previousYear: y - 1,
      current, previous,
      totalCurrent: current.reduce((s, m) => s + m.amount, 0),
      totalPrevious: previous.reduce((s, m) => s + m.amount, 0),
    };
  }

  // ── NEW: Year-over-year attendance ─────────────────────────
  async getYearOverYearAttendance(institutionId: string) {
    const y = new Date().getFullYear();
    const buildStats = async (year: number) => {
      const groups = await this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: { date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
        _count: true,
      });
      const map = Object.fromEntries(groups.map((g) => [g.status, g._count]));
      const total = Object.values(map).reduce((s, v) => s + v, 0);
      const present = (map['PRESENT'] ?? 0) + (map['LATE'] ?? 0);
      return { year, ...map, total, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
    };
    const [current, previous] = await Promise.all([buildStats(y), buildStats(y - 1)]);
    return { current, previous };
  }

  // ── NEW: Library utilization ────────────────────────────────
  async getLibraryUtilization(institutionId: string, dto: LibraryUtilizationDto) {
    const year = dto.year ?? new Date().getFullYear();
    const months = dto.month ? [dto.month - 1] : Array.from({ length: 12 }, (_, i) => i);
    return Promise.all(months.map(async (m) => {
      const start = new Date(year, m, 1);
      const end = new Date(year, m + 1, 1);
      const [issued, returned, fines] = await Promise.all([
        this.prisma.bookIssue.count({ where: { institutionId, createdAt: { gte: start, lt: end } } }),
        this.prisma.bookIssue.count({ where: { institutionId, returnedAt: { gte: start, lt: end } } }),
        this.prisma.bookIssue.aggregate({
          where: { institutionId, returnedAt: { gte: start, lt: end } }, _sum: { fine: true },
        }),
      ]);
      return {
        month: new Date(year, m).toLocaleString('default', { month: 'short' }),
        monthNum: m + 1, year, issued, returned,
        finesCollected: Number(fines._sum.fine ?? 0),
      };
    }));
  }

  // ── NEW: Trigger export job ─────────────────────────────────
  async triggerExport(entity: string, fields: string[], data: unknown[], format: string, institutionId: string) {
    const job = await this.exportQueue.add('export', { entity, fields, data, format, institutionId });
    return { jobId: job.id, message: 'Export queued. Download link ready shortly.' };
  }
}
