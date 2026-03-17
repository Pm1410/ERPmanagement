import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateAcademicYearDto, UpdateAcademicYearDto,
  CreateClassDto, UpdateClassDto,
  CreateSectionDto, UpdateSectionDto,
  CreateSubjectDto, UpdateSubjectDto,
  SaveTimetableDto,
} from './dto/academic.dto';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Academic Years ────────────────────────────────────────
  async getAcademicYears(institutionId: string) {
    return this.prisma.academicYear.findMany({
      where: { institutionId }, orderBy: { startDate: 'desc' },
    });
  }

  async createAcademicYear(dto: CreateAcademicYearDto, institutionId: string) {
    return this.prisma.academicYear.create({
      data: { ...dto, institutionId, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
    });
  }

  async updateAcademicYear(id: string, dto: UpdateAcademicYearDto, institutionId: string) {
    await this.prisma.academicYear.findFirstOrThrow({ where: { id, institutionId } });
    return this.prisma.academicYear.update({ where: { id }, data: dto });
  }

  async setCurrentAcademicYear(id: string, institutionId: string) {
    await this.prisma.$transaction([
      this.prisma.academicYear.updateMany({ where: { institutionId }, data: { isCurrent: false } }),
      this.prisma.academicYear.update({ where: { id }, data: { isCurrent: true } }),
    ]);
    return { message: 'Current academic year updated' };
  }

  // ─── Classes ───────────────────────────────────────────────
  async getClasses(academicYearId: string, institutionId: string) {
    return this.prisma.class.findMany({
      where: { academicYearId, institutionId, deletedAt: null },
      orderBy: { orderIndex: 'asc' },
      include: {
        sections: { include: { classTeacher: { select: { name: true } } } },
        _count: { select: { subjects: true } },
      },
    });
  }

  async createClass(dto: CreateClassDto, institutionId: string) {
    return this.prisma.class.create({ data: { ...dto, institutionId } });
  }

  async updateClass(id: string, dto: UpdateClassDto) {
    return this.prisma.class.update({ where: { id }, data: dto });
  }

  async deleteClass(id: string) {
    return this.prisma.class.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // ─── Sections ──────────────────────────────────────────────
  async getSections(classId: string) {
    return this.prisma.section.findMany({
      where: { classId, deletedAt: null },
      include: {
        classTeacher: { select: { name: true } },
        _count: { select: { students: true } },
      },
    });
  }

  async createSection(dto: CreateSectionDto) {
    return this.prisma.section.create({ data: dto });
  }

  async updateSection(id: string, dto: UpdateSectionDto) {
    return this.prisma.section.update({ where: { id }, data: dto });
  }

  // ─── Subjects ──────────────────────────────────────────────
  async getSubjects(classId: string) {
    return this.prisma.subject.findMany({
      where: { classId, deletedAt: null }, orderBy: { name: 'asc' },
    });
  }

  async createSubject(dto: CreateSubjectDto, institutionId: string) {
    const existing = await this.prisma.subject.findFirst({
      where: { name: dto.name, classId: dto.classId, institutionId },
    });
    if (existing) throw new ConflictException('Subject already exists for this class');
    return this.prisma.subject.create({ data: { ...dto, institutionId } });
  }

  async updateSubject(id: string, dto: UpdateSubjectDto) {
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async deleteSubject(id: string) {
    return this.prisma.subject.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // ─── Timetable ─────────────────────────────────────────────
  async saveTimetable(dto: SaveTimetableDto, institutionId: string) {
    // Delete existing slots for this class/section/year
    await this.prisma.timetableSlot.deleteMany({
      where: { classId: dto.classId, sectionId: dto.sectionId, academicYearId: dto.academicYearId },
    });

    const slots = dto.slots.map((s) => ({
      ...s,
      classId: dto.classId,
      sectionId: dto.sectionId,
      academicYearId: dto.academicYearId,
      institutionId,
    }));

    await this.prisma.timetableSlot.createMany({ data: slots });
    return { message: 'Timetable saved', count: slots.length };
  }

  async getTimetable(classId: string, sectionId: string, academicYearId?: string) {
    return this.prisma.timetableSlot.findMany({
      where: { classId, sectionId, ...(academicYearId ? { academicYearId } : {}) },
      include: {
        subject: true,
        faculty: { select: { id: true, name: true, userId: true, email: true } },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }
}
