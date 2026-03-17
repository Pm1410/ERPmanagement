import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MarkAttendanceDto, AttendanceQueryDto, LeaveRequestDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async markAttendance(dto: MarkAttendanceDto, facultyId: string) {
    const attendanceDate = new Date(dto.date);
    const now = new Date();
    const diffHours = (now.getTime() - attendanceDate.getTime()) / 3600000;

    // Allow editing within 24 hours only (faculty) — admin can always edit
    if (diffHours > 24) {
      const existing = await this.prisma.attendanceRecord.findFirst({
        where: { classId: dto.classId, sectionId: dto.sectionId, subjectId: dto.subjectId, date: attendanceDate },
      });
      if (existing) throw new BadRequestException('Attendance edit window (24 hours) has passed');
    }

    // Upsert each record
    const ops = dto.records.map((rec) =>
      this.prisma.attendanceRecord.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: rec.studentId,
            subjectId: dto.subjectId,
            date: attendanceDate,
          },
        },
        update: { status: rec.status, remarks: rec.remarks, markedById: facultyId, updatedAt: new Date() },
        create: {
          studentId: rec.studentId,
          classId: dto.classId,
          sectionId: dto.sectionId,
          subjectId: dto.subjectId,
          academicYearId: dto.academicYearId,
          date: attendanceDate,
          status: rec.status,
          remarks: rec.remarks,
          markedById: facultyId,
        },
      }),
    );

    const results = await this.prisma.$transaction(ops);
    return { message: 'Attendance marked', count: results.length };
  }

  async getAttendance(query: AttendanceQueryDto, institutionId: string) {
    const where: Record<string, unknown> = {};

    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.studentId) where.studentId = query.studentId;

    if (query.date) {
      where.date = new Date(query.date);
    } else if (query.month) {
      const [year, month] = query.month.split('-').map(Number);
      where.date = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    }

    return this.prisma.attendanceRecord.findMany({
      where,
      include: {
        student: { select: { name: true, rollNumber: true, admissionNumber: true } },
        subject: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getStudentAttendanceSummary(studentId: string, month?: string, requestingUser?: any) {
    const resolved = await this.prisma.student.findFirst({
      where: { OR: [{ id: studentId }, { userId: studentId }], deletedAt: null, isActive: true },
      select: { id: true, userId: true, institutionId: true },
    });
    if (!resolved) throw new NotFoundException('Student not found');

    // RBAC: student can only view own; parent can only view linked child
    if (requestingUser?.role === 'STUDENT' && resolved.userId !== requestingUser.id) {
      throw new ForbiddenException('Access denied');
    }
    if (requestingUser?.role === 'PARENT') {
      const parent = await this.prisma.parent.findFirst({
        where: { userId: requestingUser.id, institutionId: requestingUser.institutionId, deletedAt: null, isActive: true },
        select: { id: true },
      });
      if (!parent) throw new ForbiddenException('Parent profile not found');
      const link = await this.prisma.parentStudent.findFirst({
        where: { parentId: parent.id, studentId: resolved.id },
        select: { id: true },
      });
      if (!link) throw new ForbiddenException('Access denied');
    }

    const sid = resolved.id;

    const where: Record<string, unknown> = { studentId: sid };
    if (month) {
      const [year, m] = month.split('-').map(Number);
      where.date = { gte: new Date(year, m - 1, 1), lt: new Date(year, m, 1) };
    }

    const records = await this.prisma.attendanceRecord.findMany({ where });

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'PRESENT').length,
      absent: records.filter((r) => r.status === 'ABSENT').length,
      late: records.filter((r) => r.status === 'LATE').length,
      leave: records.filter((r) => r.status === 'LEAVE').length,
    };

    const percentage =
      summary.total > 0
        ? Math.round(((summary.present + summary.late) / summary.total) * 100)
        : 0;

    return { ...summary, percentage, records };
  }

  async getMonthlyReport(classId: string, sectionId: string, month: string, institutionId: string) {
    const [year, m] = month.split('-').map(Number);
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 1);

    const students = await this.prisma.student.findMany({
      where: { classId, sectionId, institutionId, deletedAt: null },
      select: { id: true, name: true, rollNumber: true },
    });

    const records = await this.prisma.attendanceRecord.findMany({
      where: { classId, sectionId, date: { gte: startDate, lt: endDate } },
    });

    return students.map((student) => {
      const studentRecords = records.filter((r) => r.studentId === student.id);
      const present = studentRecords.filter((r) => r.status === 'PRESENT').length;
      const absent = studentRecords.filter((r) => r.status === 'ABSENT').length;
      const late = studentRecords.filter((r) => r.status === 'LATE').length;
      const leave = studentRecords.filter((r) => r.status === 'LEAVE').length;
      const total = studentRecords.length;
      return {
        ...student,
        present, absent, late, leave, total,
        percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
      };
    });
  }

  async applyLeave(dto: LeaveRequestDto, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, institutionId },
    });
    if (!student) throw new NotFoundException('Student not found');

    return this.prisma.leaveRequest.create({
      data: {
        studentId: dto.studentId,
        leaveType: dto.leaveType,
        fromDate: new Date(dto.fromDate),
        toDate: new Date(dto.toDate),
        reason: dto.reason,
        status: 'PENDING',
      },
    });
  }

  async getLeaveRequests(studentId?: string, status?: string) {
    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    return this.prisma.leaveRequest.findMany({
      where,
      include: { student: { select: { name: true, rollNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLeaveStatus(leaveId: string, status: 'APPROVED' | 'REJECTED', approverId: string, remarks?: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException('Leave request not found');

    return this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status, approverId, approverRemarks: remarks, updatedAt: new Date() },
    });
  }
}
