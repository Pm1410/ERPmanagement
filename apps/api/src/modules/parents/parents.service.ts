import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateParentDto, LinkStudentDto } from './dto/parents.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationChannel, NotificationTemplate } from '../notification/dto/notification.dto';

@Injectable()
export class ParentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  async me(userId: string, institutionId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { userId, institutionId, deletedAt: null, isActive: true },
      include: {
        students: {
          include: {
            student: {
              include: {
                class: true,
                section: { include: { classTeacher: { select: { id: true, name: true, userId: true, email: true } } } },
              },
            },
          },
        },
      },
    });
    if (!parent) throw new NotFoundException('Parent profile not found');
    return parent;
  }

  async list(institutionId: string) {
    return this.prisma.parent.findMany({
      where: { institutionId, deletedAt: null },
      include: {
        students: { include: { student: { select: { id: true, name: true, rollNumber: true, class: { select: { name: true } }, section: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async create(dto: CreateParentDto, institutionId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const parentRole = await this.prisma.role.findFirst({ where: { name: 'PARENT' } });
    if (!parentRole) throw new NotFoundException('PARENT role not configured');

    const tempPassword = `Parent@${new Date().getFullYear()}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          roleId: parentRole.id,
          institutionId,
          isActive: true,
        },
      });

      const parent = await tx.parent.create({
        data: { userId: user.id, institutionId, name: dto.name, email: dto.email, phone: dto.phone },
      });

      if (dto.studentIds?.length) {
        await tx.parentStudent.createMany({
          data: dto.studentIds.map((sid, idx) => ({
            institutionId,
            parentId: parent.id,
            studentId: sid,
            isPrimary: idx === 0,
          })),
          skipDuplicates: true,
        });
      }

      return { parent, tempPassword };
    });

    // Fire welcome email/SMS (best-effort)
    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId },
      select: { name: true },
    });
    const institutionName = institution?.name ?? 'School ERP';
    const loginUrl = process.env.PARENT_PORTAL_URL || process.env.WEB_URL || 'http://localhost:3000/parent/dashboard';

    await this.notifications.fireEvent(
      NotificationTemplate.WELCOME_PARENT,
      [NotificationChannel.EMAIL],
      dto.email,
      {
        institutionName,
        parentName: dto.name,
        email: dto.email,
        tempPassword: result.tempPassword,
        loginUrl,
        year: new Date().getFullYear().toString(),
      },
      institutionId,
    ).catch(() => null);

    return result;
  }

  async linkStudent(parentId: string, dto: LinkStudentDto, institutionId: string) {
    const parent = await this.prisma.parent.findFirst({ where: { id: parentId, institutionId, deletedAt: null } });
    if (!parent) throw new NotFoundException('Parent not found');

    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, institutionId, deletedAt: null } });
    if (!student) throw new NotFoundException('Student not found');

    if (dto.isPrimary) {
      await this.prisma.parentStudent.updateMany({ where: { parentId }, data: { isPrimary: false } });
    }

    return this.prisma.parentStudent.upsert({
      where: { parentId_studentId: { parentId, studentId: dto.studentId } },
      update: { relation: dto.relation, isPrimary: dto.isPrimary ?? undefined },
      create: { institutionId, parentId, studentId: dto.studentId, relation: dto.relation, isPrimary: dto.isPrimary ?? false },
    });
  }
}

