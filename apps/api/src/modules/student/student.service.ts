import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3Service } from '../../common/storage/s3.service';
import { paginated, paginationParams } from '../../common/utils/response.util';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async findMe(userId: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId, institutionId, deletedAt: null, isActive: true },
      include: {
        class: true,
        section: true,
      },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async findAll(query: StudentQueryDto, requestingUser: { role: string; id: string; institutionId: string }) {
    const { page, limit, skip } = paginationParams(query);

    const where: Record<string, unknown> = {
      deletedAt: null,
      institutionId: requestingUser.institutionId,
    };
    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { admissionNumber: { contains: query.search, mode: 'insensitive' } },
        { rollNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return paginated(data, total, page, limit);
  }

  async findOne(id: string, requestingUser: { role: string; id: string; institutionId: string }) {
    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null, institutionId: requestingUser.institutionId },
      include: {
        class: true,
        section: true,
        user: { select: { email: true, lastLoginAt: true } },
        documents: true,
      },
    });

    if (!student) throw new NotFoundException('Student not found');

    // Students can only view their own profile
    if (requestingUser.role === 'STUDENT' && student.userId !== requestingUser.id) {
      throw new ForbiddenException('Access denied');
    }

    // Parents can only view linked children
    if (requestingUser.role === 'PARENT') {
      const parent = await this.prisma.parent.findFirst({
        where: { userId: requestingUser.id, institutionId: requestingUser.institutionId, deletedAt: null, isActive: true },
        select: { id: true },
      });
      if (!parent) throw new ForbiddenException('Parent profile not found');
      const link = await this.prisma.parentStudent.findFirst({
        where: { parentId: parent.id, studentId: student.id },
        select: { id: true },
      });
      if (!link) throw new ForbiddenException('Access denied');
    }

    return student;
  }

  async create(dto: CreateStudentDto, institutionId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const admissionNumber = dto.admissionNumber || await this.generateAdmissionNumber(institutionId);
    const tempPassword = `${dto.name.split(' ')[0]}@${new Date(dto.dateOfBirth).getFullYear()}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const studentRole = await this.prisma.role.findFirst({ where: { name: 'STUDENT' } });
    if (!studentRole) throw new NotFoundException('STUDENT role not configured');

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          roleId: studentRole.id,
          institutionId,
          isActive: true,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          institutionId,
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          bloodGroup: dto.bloodGroup,
          religion: dto.religion,
          category: dto.category,
          nationality: dto.nationality,
          address: dto.address,
          permanentAddress: dto.permanentAddress,
          fatherName: dto.fatherName,
          fatherPhone: dto.fatherPhone,
          fatherOccupation: dto.fatherOccupation,
          motherName: dto.motherName,
          motherPhone: dto.motherPhone,
          guardianName: dto.guardianName,
          guardianPhone: dto.guardianPhone,
          parentEmail: dto.parentEmail,
          classId: dto.classId,
          sectionId: dto.sectionId,
          admissionNumber,
          rollNumber: dto.rollNumber,
        },
      });

      return student;
    });

    return result;
  }

  async update(id: string, dto: UpdateStudentDto, institutionId: string) {
    await this.findOneOrFail(id, institutionId);

    return this.prisma.student.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, institutionId: string) {
    await this.findOneOrFail(id, institutionId);
    await this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { message: 'Student deactivated successfully' };
  }

  async uploadDocument(studentId: string, file: Express.Multer.File, docType: string, institutionId: string) {
    await this.findOneOrFail(studentId, institutionId);
    const { key, url } = await this.s3.upload(file.buffer, file.originalname, `students/${studentId}/docs`, file.mimetype);

    const doc = await this.prisma.studentDocument.create({
      data: { studentId, docType, fileName: file.originalname, fileKey: key, fileUrl: url },
    });
    return doc;
  }

  async getDocuments(studentId: string, institutionId: string) {
    await this.findOneOrFail(studentId, institutionId);
    const docs = await this.prisma.studentDocument.findMany({ where: { studentId } });
    // Refresh signed URLs
    return Promise.all(docs.map(async (d) => ({ ...d, fileUrl: await this.s3.getSignedUrl(d.fileKey) })));
  }

  private async findOneOrFail(id: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  private async generateAdmissionNumber(institutionId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.student.count({ where: { institutionId } });
    return `ADM-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
