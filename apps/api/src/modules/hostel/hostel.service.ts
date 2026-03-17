import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateHostelRoomDto, UpdateHostelRoomDto, AllocateHostelDto, VacateHostelDto } from './dto/hostel.dto';

@Injectable()
export class HostelService {
  constructor(private readonly prisma: PrismaService) {}

  async listRooms(institutionId: string) {
    return this.prisma.hostelRoom.findMany({
      where: { institutionId, deletedAt: null },
      orderBy: [{ hostelName: 'asc' }, { name: 'asc' }],
      include: {
        allocations: {
          where: { status: 'ACTIVE' },
          include: { student: { select: { id: true, name: true, admissionNumber: true, class: { select: { name: true } }, section: { select: { name: true } } } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { allocations: true } },
      },
    });
  }

  async createRoom(dto: CreateHostelRoomDto, institutionId: string) {
    try {
      return await this.prisma.hostelRoom.create({
        data: {
          institutionId,
          name: dto.name,
          hostelName: dto.hostelName ?? 'Main Hostel',
          floor: dto.floor ?? 1,
          roomType: dto.roomType ?? 'SHARED',
          capacity: dto.capacity ?? 4,
          isActive: dto.isActive ?? true,
          notes: dto.notes,
        },
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') throw new ConflictException('Room name already exists');
      throw e;
    }
  }

  async updateRoom(id: string, dto: UpdateHostelRoomDto, institutionId: string) {
    const room = await this.prisma.hostelRoom.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!room) throw new NotFoundException('Room not found');
    return this.prisma.hostelRoom.update({
      where: { id },
      data: {
        ...dto,
        hostelName: dto.hostelName ?? undefined,
      },
    });
  }

  async deleteRoom(id: string, institutionId: string) {
    const room = await this.prisma.hostelRoom.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!room) throw new NotFoundException('Room not found');

    const activeAlloc = await this.prisma.hostelAllocation.count({ where: { roomId: id, status: 'ACTIVE' } });
    if (activeAlloc > 0) throw new BadRequestException('Cannot delete room with active allocations');

    await this.prisma.hostelRoom.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'Room deleted' };
  }

  async listAllocations(institutionId: string, status?: string) {
    return this.prisma.hostelAllocation.findMany({
      where: { institutionId, ...(status ? { status } : {} ) },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, admissionNumber: true, class: { select: { name: true } }, section: { select: { name: true } } } },
        room: { select: { id: true, name: true, hostelName: true } },
      },
    });
  }

  async allocate(dto: AllocateHostelDto, institutionId: string) {
    const room = await this.prisma.hostelRoom.findFirst({ where: { id: dto.roomId, institutionId, deletedAt: null, isActive: true } });
    if (!room) throw new NotFoundException('Room not found');

    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, institutionId, deletedAt: null, isActive: true } });
    if (!student) throw new NotFoundException('Student not found');

    const already = await this.prisma.hostelAllocation.findFirst({ where: { studentId: dto.studentId, status: 'ACTIVE' } });
    if (already) throw new ConflictException('Student already has an active hostel allocation');

    const activeCount = await this.prisma.hostelAllocation.count({ where: { roomId: room.id, status: 'ACTIVE' } });
    if (activeCount >= room.capacity) throw new BadRequestException('Room is full');

    return this.prisma.hostelAllocation.create({
      data: {
        institutionId,
        studentId: dto.studentId,
        roomId: dto.roomId,
        bedNo: dto.bedNo,
        notes: dto.notes,
        status: 'ACTIVE',
      },
    });
  }

  async vacate(dto: VacateHostelDto, institutionId: string) {
    const allocation = await this.prisma.hostelAllocation.findFirst({ where: { id: dto.allocationId, institutionId } });
    if (!allocation) throw new NotFoundException('Allocation not found');
    if (allocation.status !== 'ACTIVE') throw new BadRequestException('Allocation is not active');

    return this.prisma.hostelAllocation.update({
      where: { id: allocation.id },
      data: {
        status: 'VACATED',
        endDate: new Date(),
        notes: dto.notes ?? allocation.notes,
      },
    });
  }
}

