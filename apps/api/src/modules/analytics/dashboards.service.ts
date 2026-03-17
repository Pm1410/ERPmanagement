import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Dashboard 1: Academic Performance ──────────────────────
  async getAcademicDashboard(institutionId: string, academicYearId?: string) {
    const [passFailByClass, subjectAverages, topStudents, bottomStudents, gradeDistribution] =
      await Promise.all([
        this.getPassFailByClass(institutionId),
        this.getSubjectAverages(institutionId),
        this.getTopStudents(institutionId, 10),
        this.getBottomStudents(institutionId, 10),
        this.getGradeDistribution(institutionId),
      ]);

    return { passFailByClass, subjectAverages, topStudents, bottomStudents, gradeDistribution };
  }

  private async getPassFailByClass(institutionId: string) {
    const classes = await this.prisma.class.findMany({
      where: { institutionId, deletedAt: null },
      select: { id: true, name: true },
    });

    return Promise.all(
      classes.map(async (cls) => {
        const grades = await this.prisma.grade.findMany({
          where: { classId: cls.id },
          select: { isPassed: true },
        });
        const pass = grades.filter((g) => g.isPassed).length;
        const fail = grades.length - pass;
        const passRate = grades.length > 0 ? Math.round((pass / grades.length) * 100) : 0;
        return { className: cls.name, pass, fail, total: grades.length, passRate };
      }),
    );
  }

  private async getSubjectAverages(institutionId: string) {
    const subjects = await this.prisma.subject.findMany({
      where: { institutionId, deletedAt: null },
      select: { id: true, name: true },
    });

    const results = await Promise.all(
      subjects.map(async (sub) => {
        const agg = await this.prisma.grade.aggregate({
          where: { subjectId: sub.id },
          _avg: { marksObtained: true },
          _count: true,
        });
        return {
          subjectName: sub.name,
          average: agg._avg.marksObtained ? Math.round(Number(agg._avg.marksObtained) * 100) / 100 : 0,
          studentCount: agg._count,
        };
      }),
    );

    return results.filter((r) => r.studentCount > 0).sort((a, b) => b.average - a.average);
  }

  private async getTopStudents(institutionId: string, n: number) {
    // Aggregate total marks per student
    const grades = await this.prisma.grade.groupBy({
      by: ['studentId'],
      where: { student: { institutionId } },
      _sum: { marksObtained: true, maxMarks: true },
      orderBy: { _sum: { marksObtained: 'desc' } },
      take: n,
    });

    const studentIds = grades.map((g) => g.studentId);
    const students = await this.prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
    });

    const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
    return grades.map((g) => ({
      ...studentMap[g.studentId],
      totalMarks: Number(g._sum.marksObtained ?? 0),
      maxMarks: g._sum.maxMarks ?? 0,
      percentage: g._sum.maxMarks
        ? Math.round((Number(g._sum.marksObtained ?? 0) / g._sum.maxMarks) * 100)
        : 0,
    }));
  }

  private async getBottomStudents(institutionId: string, n: number) {
    const grades = await this.prisma.grade.groupBy({
      by: ['studentId'],
      where: { student: { institutionId } },
      _sum: { marksObtained: true, maxMarks: true },
      orderBy: { _sum: { marksObtained: 'asc' } },
      take: n,
    });

    const studentIds = grades.map((g) => g.studentId);
    const students = await this.prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, rollNumber: true, class: { select: { name: true } } },
    });

    const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
    return grades.map((g) => ({
      ...studentMap[g.studentId],
      totalMarks: Number(g._sum.marksObtained ?? 0),
      maxMarks: g._sum.maxMarks ?? 0,
      percentage: g._sum.maxMarks
        ? Math.round((Number(g._sum.marksObtained ?? 0) / g._sum.maxMarks) * 100)
        : 0,
    }));
  }

  private async getGradeDistribution(institutionId: string) {
    const records = await this.prisma.grade.groupBy({
      by: ['grade'],
      where: { student: { institutionId } },
      _count: true,
    });
    const order = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
    return records
      .filter((r) => r.grade)
      .sort((a, b) => order.indexOf(a.grade!) - order.indexOf(b.grade!))
      .map((r) => ({ grade: r.grade, count: r._count }));
  }

  // ── Dashboard 2: Financial ──────────────────────────────────
  async getFinancialDashboard(institutionId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    const [
      monthlyCollection,
      collectionByMode,
      defaulterAgingBuckets,
      feeHeadBreakdown,
      totalOutstanding,
    ] = await Promise.all([
      this.getMonthlyCollection(institutionId, y),
      this.getCollectionByMode(institutionId, y),
      this.getDefaulterAgingBuckets(institutionId),
      this.getFeeHeadBreakdown(institutionId, y),
      this.getTotalOutstanding(institutionId),
    ]);

    return { monthlyCollection, collectionByMode, defaulterAgingBuckets, feeHeadBreakdown, totalOutstanding };
  }

  private async getMonthlyCollection(institutionId: string, year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i);
    return Promise.all(
      months.map(async (m) => {
        const start = new Date(year, m, 1);
        const end = new Date(year, m + 1, 1);
        const agg = await this.prisma.feePayment.aggregate({
          where: { institutionId, status: 'SUCCESS', paidAt: { gte: start, lt: end } },
          _sum: { amount: true },
          _count: true,
        });
        return {
          month: new Date(year, m).toLocaleString('default', { month: 'short' }),
          monthNum: m + 1,
          collected: Number(agg._sum.amount ?? 0),
          transactions: agg._count,
        };
      }),
    );
  }

  private async getCollectionByMode(institutionId: string, year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const groups = await this.prisma.feePayment.groupBy({
      by: ['paymentMode'],
      where: { institutionId, status: 'SUCCESS', paidAt: { gte: start, lt: end } },
      _sum: { amount: true },
      _count: true,
    });
    return groups.map((g) => ({
      mode: g.paymentMode,
      amount: Number(g._sum.amount ?? 0),
      count: g._count,
    }));
  }

  private async getDefaulterAgingBuckets(institutionId: string) {
    const now = new Date();
    const buckets = [
      { label: '0–30 days', days: 30 },
      { label: '31–60 days', days: 60 },
      { label: '61–90 days', days: 90 },
      { label: '90+ days', days: Infinity },
    ];

    const pending = await this.prisma.feePayment.findMany({
      where: { institutionId, status: 'PENDING' },
      select: { amount: true, createdAt: true },
    });

    return buckets.map(({ label, days }, idx) => {
      const prevDays = idx === 0 ? 0 : buckets[idx - 1].days;
      const count = pending.filter((p) => {
        const age = Math.floor((now.getTime() - p.createdAt.getTime()) / 86400000);
        return age >= prevDays && (days === Infinity ? true : age < days);
      });
      return {
        bucket: label,
        count: count.length,
        amount: count.reduce((s, p) => s + Number(p.amount), 0),
      };
    });
  }

  private async getFeeHeadBreakdown(institutionId: string, year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const groups = await this.prisma.feePayment.groupBy({
      by: ['feeHeadId'],
      where: { institutionId, status: 'SUCCESS', paidAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    const headIds = groups.map((g) => g.feeHeadId);
    const heads = await this.prisma.feeHead.findMany({
      where: { id: { in: headIds } },
      select: { id: true, name: true },
    });
    const headMap = Object.fromEntries(heads.map((h) => [h.id, h.name]));

    return groups.map((g) => ({
      feeHead: headMap[g.feeHeadId] ?? g.feeHeadId,
      amount: Number(g._sum.amount ?? 0),
    }));
  }

  private async getTotalOutstanding(institutionId: string) {
    const agg = await this.prisma.feePayment.aggregate({
      where: { institutionId, status: 'PENDING' },
      _sum: { amount: true },
      _count: true,
    });
    return {
      totalOutstanding: Number(agg._sum.amount ?? 0),
      pendingTransactions: agg._count,
    };
  }

  // ── Dashboard 3: Operational ────────────────────────────────
  async getOperationalDashboard(institutionId: string) {
    const [
      attendanceSummaryByClass,
      libraryUtilization,
      grievanceSummary,
      staffLeaveSummary,
      hostelOccupancy,
    ] = await Promise.all([
      this.getAttendanceSummaryByClass(institutionId),
      this.getLibraryUtilization(institutionId),
      this.getGrievanceSummary(institutionId),
      this.getStaffLeaveSummary(institutionId),
      this.getHostelOccupancy(institutionId),
    ]);

    return { attendanceSummaryByClass, libraryUtilization, grievanceSummary, staffLeaveSummary, hostelOccupancy };
  }

  private async getAttendanceSummaryByClass(institutionId: string) {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const classes = await this.prisma.class.findMany({
      where: { institutionId, deletedAt: null },
      select: { id: true, name: true },
    });

    return Promise.all(
      classes.map(async (cls) => {
        const records = await this.prisma.attendanceRecord.groupBy({
          by: ['status'],
          where: { classId: cls.id, date: { gte: monthStart } },
          _count: true,
        });
        const map = Object.fromEntries(records.map((r) => [r.status, r._count]));
        const total = Object.values(map).reduce((s, v) => s + v, 0);
        const present = (map['PRESENT'] ?? 0) + (map['LATE'] ?? 0);
        return {
          className: cls.name,
          present: map['PRESENT'] ?? 0,
          absent: map['ABSENT'] ?? 0,
          late: map['LATE'] ?? 0,
          leave: map['LEAVE'] ?? 0,
          total,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      }),
    );
  }

  private async getLibraryUtilization(institutionId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [issued, returned, overdue, totalBooks] = await Promise.all([
      this.prisma.bookIssue.count({ where: { institutionId, createdAt: { gte: monthStart } } }),
      this.prisma.bookIssue.count({ where: { institutionId, returnedAt: { gte: monthStart } } }),
      this.prisma.bookIssue.count({ where: { institutionId, returnedAt: null, dueDate: { lt: now } } }),
      this.prisma.book.aggregate({ where: { institutionId, deletedAt: null }, _sum: { totalCopies: true } }),
    ]);

    return {
      issuedThisMonth: issued,
      returnedThisMonth: returned,
      currentlyOverdue: overdue,
      totalBooks: totalBooks._sum.totalCopies ?? 0,
    };
  }

  private async getGrievanceSummary(institutionId: string) {
    const records = await this.prisma.grievance.groupBy({
      by: ['status'],
      where: { institutionId },
      _count: true,
    });
    const map = Object.fromEntries(records.map((r) => [r.status, r._count]));
    return {
      open: map['OPEN'] ?? 0,
      inProgress: map['IN_PROGRESS'] ?? 0,
      resolved: map['RESOLVED'] ?? 0,
      closed: map['CLOSED'] ?? 0,
    };
  }

  private async getStaffLeaveSummary(institutionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await this.prisma.staffLeave.groupBy({
      by: ['status'],
      where: { institutionId },
      _count: true,
    });
    const map = Object.fromEntries(records.map((r) => [r.status, r._count]));

    const onLeaveToday = await this.prisma.staffLeave.count({
      where: {
        institutionId,
        status: 'APPROVED',
        fromDate: { lte: today },
        toDate: { gte: today },
      },
    });

    return {
      pendingApprovals: map['PENDING'] ?? 0,
      approvedThisMonth: map['APPROVED'] ?? 0,
      onLeaveToday,
    };
  }

  private async getHostelOccupancy(institutionId: string) {
    try {
      const rooms = await this.prisma.hostelRoom.findMany({
        where: { institutionId, deletedAt: null, isActive: true },
        select: { id: true, capacity: true },
      });
      const totalRooms = rooms.length;
      const totalBeds = rooms.reduce((s, r) => s + (r.capacity ?? 0), 0);
      const occupiedBeds = await this.prisma.hostelAllocation.count({
        where: { institutionId, status: 'ACTIVE' },
      });
      const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
      return { totalRooms, totalBeds, occupiedBeds, vacantBeds, occupancyRate };
    } catch {
      return { totalRooms: 0, totalBeds: 0, occupiedBeds: 0, vacantBeds: 0, occupancyRate: 0 };
    }
  }
}
