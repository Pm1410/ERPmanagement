import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateExamDto, UpdateExamDto,
  CreateExamScheduleDto, BulkMarksEntryDto,
} from './dto/exam.dto';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Exams CRUD ─────────────────────────────────────────────
  async getExams(institutionId: string, academicYearId?: string) {
    return this.prisma.exam.findMany({
      where: { institutionId, deletedAt: null, ...(academicYearId ? { academicYearId } : {}) },
      include: { _count: { select: { schedules: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createExam(dto: CreateExamDto, institutionId: string) {
    return this.prisma.exam.create({
      data: {
        ...dto,
        institutionId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async updateExam(id: string, dto: UpdateExamDto, institutionId: string) {
    await this.findExamOrFail(id, institutionId);
    return this.prisma.exam.update({ where: { id }, data: dto });
  }

  async deleteExam(id: string, institutionId: string) {
    await this.findExamOrFail(id, institutionId);
    await this.prisma.exam.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Exam deleted' };
  }

  // ── Exam Schedules ─────────────────────────────────────────
  async getSchedules(examId: string, classId?: string) {
    return this.prisma.examSchedule.findMany({
      where: { examId, deletedAt: null, ...(classId ? { classId } : {}) },
      include: {
        subject: true,
        class: true,
        section: true,
        invigilator: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    });
  }

  async createSchedule(dto: CreateExamScheduleDto, institutionId: string) {
    // Check for scheduling conflict
    const conflict = await this.prisma.examSchedule.findFirst({
      where: {
        classId: dto.classId,
        sectionId: dto.sectionId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        deletedAt: null,
      },
    });
    if (conflict) throw new BadRequestException('Exam schedule conflict detected for this class/section/time');

    return this.prisma.examSchedule.create({
      data: {
        ...dto,
        institutionId,
        date: new Date(dto.date),
      },
    });
  }

  // ── Marks Entry ────────────────────────────────────────────
  async bulkEnterMarks(dto: BulkMarksEntryDto, facultyId: string) {
    const schedule = await this.prisma.examSchedule.findUnique({
      where: { id: dto.examScheduleId },
    });
    if (!schedule) throw new NotFoundException('Exam schedule not found');
    if (schedule.isFinalized) throw new BadRequestException('Marks are already finalized and cannot be edited');

    const ops = dto.entries.map((entry) => {
      if (entry.marksObtained > schedule.maxMarks) {
        throw new BadRequestException(
          `Marks for student ${entry.studentId} exceed max marks (${schedule.maxMarks})`,
        );
      }
      const grade = entry.grade || this.computeGrade(entry.marksObtained, schedule.maxMarks);
      const isPassed = entry.marksObtained >= (schedule.passMarks ?? schedule.maxMarks * 0.35);

      return this.prisma.grade.upsert({
        where: {
          studentId_examScheduleId: {
            studentId: entry.studentId,
            examScheduleId: dto.examScheduleId,
          },
        },
        update: { marksObtained: entry.marksObtained, grade, isPassed, remarks: entry.remarks, enteredById: facultyId },
        create: {
          studentId: entry.studentId,
          examScheduleId: dto.examScheduleId,
          examId: schedule.examId,
          subjectId: schedule.subjectId,
          classId: schedule.classId,
          sectionId: schedule.sectionId,
          maxMarks: schedule.maxMarks,
          marksObtained: entry.marksObtained,
          grade,
          isPassed,
          remarks: entry.remarks,
          enteredById: facultyId,
        },
      });
    });

    const results = await this.prisma.$transaction(ops);
    return { message: 'Marks entered successfully', count: results.length };
  }

  async finalizeMarks(scheduleId: string) {
    await this.prisma.examSchedule.update({
      where: { id: scheduleId },
      data: { isFinalized: true },
    });
    return { message: 'Marks finalized — no further edits allowed' };
  }

  // ── Results ────────────────────────────────────────────────
  async getStudentResults(studentId: string, examId?: string, requestingUser?: any) {
    const resolved = await this.prisma.student.findFirst({
      where: { OR: [{ id: studentId }, { userId: studentId }], deletedAt: null, isActive: true },
      select: { id: true, userId: true, institutionId: true },
    });
    if (!resolved) throw new NotFoundException('Student not found');

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
    if (examId) where.examId = examId;

    const grades = await this.prisma.grade.findMany({
      where,
      include: { subject: true, exam: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!grades.length) return [];

    // Group by exam
    const byExam = grades.reduce((acc: Record<string, typeof grades>, g) => {
      const key = g.examId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(g);
      return acc;
    }, {});

    return Object.entries(byExam).map(([eid, records]) => {
      const totalMax = records.reduce((s, r) => s + r.maxMarks, 0);
      const totalObtained = records.reduce((s, r) => s + Number(r.marksObtained), 0);
      const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      const overallGrade = this.computeGrade(totalObtained, totalMax);
      return {
        examId: eid,
        examName: records[0]?.exam?.name,
        subjects: records,
        totalMax,
        totalObtained,
        percentage,
        overallGrade,
        isPassed: records.every((r) => r.isPassed),
      };
    });
  }

  async getClassResults(examId: string, classId: string, sectionId: string) {
    const grades = await this.prisma.grade.findMany({
      where: { examId, classId, sectionId },
      include: {
        student: { select: { name: true, rollNumber: true } },
        subject: { select: { name: true } },
      },
      orderBy: { student: { rollNumber: 'asc' } },
    });

    // Compute rank
    const studentTotals: Record<string, number> = {};
    grades.forEach((g) => {
      if (!studentTotals[g.studentId]) studentTotals[g.studentId] = 0;
      studentTotals[g.studentId] += Number(g.marksObtained);
    });

    const ranked = Object.entries(studentTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([sid, total], idx) => ({ studentId: sid, total, rank: idx + 1 }));

    return { grades, ranked };
  }

  // ── Helpers ────────────────────────────────────────────────
  private computeGrade(obtained: number, max: number): string {
    const pct = max > 0 ? (obtained / max) * 100 : 0;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  }

  private async findExamOrFail(id: string, institutionId: string) {
    const exam = await this.prisma.exam.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }
}
