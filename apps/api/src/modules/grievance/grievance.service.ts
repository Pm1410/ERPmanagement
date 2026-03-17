import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGrievanceDto, UpdateGrievanceDto } from './dto/grievance.dto';

@Injectable()
export class GrievanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: EventEmitter2,
  ) {}

  async create(dto: CreateGrievanceDto, submittedById: string, institutionId: string) {
    const ticketNumber = await this.generateTicket(institutionId);
    const grievance = await this.prisma.grievance.create({
      data: {
        ...dto,
        submittedById: dto.isAnonymous ? undefined : submittedById,
        institutionId,
        ticketNumber,
        status: 'OPEN',
      },
    });
    return grievance;
  }

  async findAll(
    query: { status?: string; category?: string; assignedToId?: string; raisedByUserId?: string },
    institutionId: string,
  ) {
    const where: Record<string, unknown> = { institutionId, deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.raisedByUserId) where.submittedById = query.raisedByUserId;
    return this.prisma.grievance.findMany({
      where,
      include: {
        submittedBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, institutionId: string) {
    const g = await this.prisma.grievance.findFirst({ where: { id, institutionId } });
    if (!g) throw new NotFoundException('Grievance not found');
    return g;
  }

  async update(id: string, dto: UpdateGrievanceDto, updatedById: string, institutionId: string) {
    await this.findOne(id, institutionId);
    const updated = await this.prisma.grievance.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    });
    this.emitter.emit('grievance:updated', { grievance: updated });
    return updated;
  }

  private async generateTicket(institutionId: string): Promise<string> {
    const count = await this.prisma.grievance.count({ where: { institutionId } });
    return `GRV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
}
