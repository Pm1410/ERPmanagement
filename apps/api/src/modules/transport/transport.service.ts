import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  AssignStudentTransportDto,
  CreateRouteDto,
  CreateStopDto,
  CreateVehicleDto,
  UnassignStudentTransportDto,
  UpdateRouteDto,
  UpdateVehicleDto,
} from './dto/transport.dto';

@Injectable()
export class TransportService {
  constructor(private readonly prisma: PrismaService) {}

  listVehicles(institutionId: string) {
    return this.prisma.transportVehicle.findMany({
      where: { institutionId, deletedAt: null },
      orderBy: { vehicleNo: 'asc' },
    });
  }

  async createVehicle(dto: CreateVehicleDto, institutionId: string) {
    try {
      return await this.prisma.transportVehicle.create({
        data: {
          institutionId,
          vehicleNo: dto.vehicleNo,
          type: dto.type ?? 'BUS',
          capacity: dto.capacity ?? 40,
          driverName: dto.driverName,
          driverPhone: dto.driverPhone,
        },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') throw new ConflictException('Vehicle number already exists');
      throw e;
    }
  }

  async updateVehicle(id: string, dto: UpdateVehicleDto, institutionId: string) {
    const v = await this.prisma.transportVehicle.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!v) throw new NotFoundException('Vehicle not found');
    return this.prisma.transportVehicle.update({ where: { id }, data: { ...dto } });
  }

  async deleteVehicle(id: string, institutionId: string) {
    const v = await this.prisma.transportVehicle.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!v) throw new NotFoundException('Vehicle not found');
    await this.prisma.transportVehicle.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'Vehicle deleted' };
  }

  listRoutes(institutionId: string) {
    return this.prisma.transportRoute.findMany({
      where: { institutionId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: { vehicle: true, stops: { orderBy: { order: 'asc' } }, _count: { select: { assignments: true } } },
    });
  }

  async createRoute(dto: CreateRouteDto, institutionId: string) {
    try {
      return await this.prisma.transportRoute.create({
        data: { institutionId, name: dto.name, vehicleId: dto.vehicleId },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') throw new ConflictException('Route name already exists');
      throw e;
    }
  }

  async updateRoute(id: string, dto: UpdateRouteDto, institutionId: string) {
    const r = await this.prisma.transportRoute.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!r) throw new NotFoundException('Route not found');
    return this.prisma.transportRoute.update({ where: { id }, data: { ...dto } });
  }

  async deleteRoute(id: string, institutionId: string) {
    const r = await this.prisma.transportRoute.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!r) throw new NotFoundException('Route not found');
    await this.prisma.transportRoute.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'Route deleted' };
  }

  async addStop(dto: CreateStopDto, institutionId: string) {
    const route = await this.prisma.transportRoute.findFirst({ where: { id: dto.routeId, institutionId, deletedAt: null } });
    if (!route) throw new NotFoundException('Route not found');
    return this.prisma.transportStop.create({
      data: {
        routeId: dto.routeId,
        name: dto.name,
        order: dto.order ?? 0,
        pickupTime: dto.pickupTime,
        dropTime: dto.dropTime,
      },
    });
  }

  async assignStudent(dto: AssignStudentTransportDto, institutionId: string) {
    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, institutionId, deletedAt: null, isActive: true } });
    if (!student) throw new NotFoundException('Student not found');

    const route = await this.prisma.transportRoute.findFirst({ where: { id: dto.routeId, institutionId, deletedAt: null, isActive: true } });
    if (!route) throw new NotFoundException('Route not found');

    if (dto.stopId) {
      const stop = await this.prisma.transportStop.findFirst({ where: { id: dto.stopId, routeId: dto.routeId } });
      if (!stop) throw new NotFoundException('Stop not found');
    }

    const already = await this.prisma.transportAssignment.findFirst({ where: { studentId: dto.studentId, status: 'ACTIVE' } });
    if (already) throw new ConflictException('Student already has an active transport assignment');

    return this.prisma.transportAssignment.create({
      data: { institutionId, studentId: dto.studentId, routeId: dto.routeId, stopId: dto.stopId, status: 'ACTIVE' },
    });
  }

  async unassignStudent(dto: UnassignStudentTransportDto, institutionId: string) {
    const a = await this.prisma.transportAssignment.findFirst({ where: { id: dto.assignmentId, institutionId } });
    if (!a) throw new NotFoundException('Assignment not found');
    if (a.status !== 'ACTIVE') throw new BadRequestException('Assignment not active');
    return this.prisma.transportAssignment.update({
      where: { id: a.id },
      data: { status: 'INACTIVE', endDate: new Date() },
    });
  }

  async listAssignments(institutionId: string, status?: string, studentId?: string, requestingUser?: any) {
    let sid = studentId;
    if (studentId) {
      const resolved = await this.prisma.student.findFirst({
        where: { institutionId, deletedAt: null, OR: [{ id: studentId }, { userId: studentId }] },
        select: { id: true, userId: true },
      });
      if (!resolved) throw new NotFoundException('Student not found');

      if (requestingUser?.role === 'STUDENT' && resolved.userId !== requestingUser.id) {
        throw new ForbiddenException('Access denied');
      }
      if (requestingUser?.role === 'PARENT') {
        const parent = await this.prisma.parent.findFirst({
          where: { userId: requestingUser.id, institutionId, deletedAt: null, isActive: true },
          select: { id: true },
        });
        if (!parent) throw new ForbiddenException('Parent profile not found');
        const link = await this.prisma.parentStudent.findFirst({
          where: { parentId: parent.id, studentId: resolved.id },
          select: { id: true },
        });
        if (!link) throw new ForbiddenException('Access denied');
      }

      sid = resolved.id;
    }
    return this.prisma.transportAssignment.findMany({
      where: { institutionId, ...(status ? { status } : {}), ...(sid ? { studentId: sid } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, admissionNumber: true, class: { select: { name: true } }, section: { select: { name: true } } } },
        route: { select: { id: true, name: true } },
        stop: { select: { id: true, name: true } },
      },
    });
  }
}

