import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateAdmissionApplicationDto,
  CreateAdmissionEnquiryDto,
  UpdateAdmissionApplicationDto,
  UpdateAdmissionEnquiryDto,
} from './dto/admissions.dto';

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Enquiries
  listEnquiries(institutionId: string, status?: string, search?: string) {
    return this.prisma.admissionEnquiry.findMany({
      where: {
        institutionId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { parentName: { contains: search, mode: 'insensitive' } },
                { parentPhone: { contains: search, mode: 'insensitive' } },
                { childName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createEnquiry(dto: CreateAdmissionEnquiryDto, institutionId: string) {
    return this.prisma.admissionEnquiry.create({
      data: {
        institutionId,
        parentName: dto.parentName,
        parentPhone: dto.parentPhone,
        childName: dto.childName,
        classInterested: dto.classInterested,
        source: dto.source ?? 'WALK_IN',
        status: dto.status ?? 'NEW',
      },
    });
  }

  async updateEnquiry(id: string, dto: UpdateAdmissionEnquiryDto, institutionId: string) {
    const row = await this.prisma.admissionEnquiry.findFirst({ where: { id, institutionId } });
    if (!row) throw new NotFoundException('Enquiry not found');
    return this.prisma.admissionEnquiry.update({ where: { id }, data: { ...dto } });
  }

  // Applications
  listApplications(institutionId: string, status?: string, search?: string) {
    return this.prisma.admissionApplication.findMany({
      where: {
        institutionId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { applicationNo: { contains: search, mode: 'insensitive' } },
                { studentName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  createApplication(dto: CreateAdmissionApplicationDto, institutionId: string) {
    return this.prisma.admissionApplication.create({
      data: {
        institutionId,
        applicationNo: dto.applicationNo,
        studentName: dto.studentName,
        dateOfBirth: new Date(dto.dateOfBirth),
        classApplied: dto.classApplied,
        status: dto.status ?? 'PENDING',
      },
    });
  }

  async updateApplication(id: string, dto: UpdateAdmissionApplicationDto, institutionId: string) {
    const row = await this.prisma.admissionApplication.findFirst({ where: { id, institutionId } });
    if (!row) throw new NotFoundException('Application not found');
    const data: any = { ...dto };
    if (dto.dateOfBirth) data.dateOfBirth = new Date(dto.dateOfBirth);
    return this.prisma.admissionApplication.update({ where: { id }, data });
  }
}

