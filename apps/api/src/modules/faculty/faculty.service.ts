import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { paginated, paginationParams } from '../../common/utils/response.util';
import { CreateFacultyDto, UpdateFacultyDto, FacultyQueryDto, AssignSubjectDto } from './dto/faculty.dto';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId, institutionId, deletedAt: null, isActive: true },
      include: { assignments: { include: { class: true, section: true, subject: true } } },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  async findAll(query: FacultyQueryDto, institutionId: string) {
    const { page, limit, skip } = paginationParams(query);
    const where: Record<string, unknown> = { deletedAt: null, institutionId };
    if (query.department) where.department = query.department;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.faculty.findMany({
        where, skip, take: limit, orderBy: { name: 'asc' },
        include: { assignments: { include: { class: true, section: true, subject: true } } },
      }),
      this.prisma.faculty.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async findOne(id: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, institutionId, deletedAt: null },
      include: {
        assignments: { include: { class: true, section: true, subject: true } },
        user: { select: { email: true, lastLoginAt: true } },
      },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');
    return faculty;
  }

  async create(dto: CreateFacultyDto, institutionId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const facultyRole = await this.prisma.role.findFirst({ where: { name: 'FACULTY' } });
    if (!facultyRole) throw new NotFoundException('FACULTY role not configured');

    const tempPassword = `Faculty@${new Date().getFullYear()}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: dto.email, password: hashedPassword, name: dto.name, roleId: facultyRole.id, institutionId, isActive: true },
      });
      return tx.faculty.create({
        data: {
          userId: user.id, institutionId, name: dto.name, email: dto.email,
          phone: dto.phone, gender: dto.gender, qualification: dto.qualification,
          specialization: dto.specialization, experience: dto.experience,
          employmentType: dto.employmentType, designation: dto.designation,
          department: dto.department,
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          address: dto.address, emergencyContact: dto.emergencyContact,
        },
      });
    });
  }

  async update(id: string, dto: UpdateFacultyDto, institutionId: string) {
    await this.findOne(id, institutionId);
    return this.prisma.faculty.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
      },
    });
  }

  async remove(id: string, institutionId: string) {
    await this.findOne(id, institutionId);
    await this.prisma.faculty.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'Faculty deactivated' };
  }

  async assignSubjects(id: string, dto: AssignSubjectDto, institutionId: string) {
    await this.findOne(id, institutionId);
    // Remove existing assignments for this class/section/year combo
    await this.prisma.facultyAssignment.deleteMany({
      where: { facultyId: id, classId: dto.classId, sectionId: dto.sectionId, academicYearId: dto.academicYearId },
    });
    const assignments = dto.subjectIds.map((subjectId) => ({
      facultyId: id, subjectId, classId: dto.classId, sectionId: dto.sectionId, academicYearId: dto.academicYearId,
    }));
    await this.prisma.facultyAssignment.createMany({ data: assignments });
    return { message: 'Subjects assigned successfully', count: assignments.length };
  }

  async getTimetable(id: string, institutionId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { institutionId, deletedAt: null, OR: [{ id }, { userId: id }] },
      select: { id: true },
    });
    if (!faculty) throw new NotFoundException('Faculty not found');
    return this.prisma.timetableSlot.findMany({
      where: { facultyId: faculty.id },
      include: { subject: true, class: true, section: true },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }
}
