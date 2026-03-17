import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { paginated, paginationParams } from '../../common/utils/response.util';
import {
  CreateFeeStructureDto, CollectFeeDto,
  InitiateOnlinePaymentDto, ConcessionDto, FeeHeadDto,
} from './dto/fee.dto';

@Injectable()
export class FeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ── Fee Heads ──────────────────────────────────────────────
  async getFeeHeads(institutionId: string) {
    return this.prisma.feeHead.findMany({ where: { institutionId, deletedAt: null } });
  }

  async createFeeHead(dto: FeeHeadDto, institutionId: string) {
    return this.prisma.feeHead.create({ data: { ...dto, institutionId } });
  }

  // ── Fee Structures ─────────────────────────────────────────
  async getFeeStructure(classId: string, academicYearId: string) {
    return this.prisma.feeStructure.findFirst({
      where: { classId, academicYearId, deletedAt: null },
      include: { items: { include: { feeHead: true } } },
    });
  }

  async createFeeStructure(dto: CreateFeeStructureDto, institutionId: string) {
    const existing = await this.prisma.feeStructure.findFirst({
      where: { classId: dto.classId, academicYearId: dto.academicYearId, deletedAt: null },
    });
    if (existing) throw new BadRequestException('Fee structure already exists for this class/year');

    return this.prisma.$transaction(async (tx) => {
      const structure = await tx.feeStructure.create({
        data: {
          classId: dto.classId,
          academicYearId: dto.academicYearId,
          institutionId,
          frequency: dto.frequency,
          lateFeePerDay: dto.lateFeePerDay,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        },
      });
      await tx.feeStructureItem.createMany({
        data: dto.items.map((item) => ({ ...item, feeStructureId: structure.id })),
      });
      return structure;
    });
  }

  // ── Student Fee Dues ───────────────────────────────────────
  async getStudentDues(studentId: string, institutionId: string, requestingUser?: any) {
    const student = await this.prisma.student.findFirst({
      where: { institutionId, OR: [{ id: studentId }, { userId: studentId }] },
      include: { class: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    if (requestingUser?.role === 'STUDENT' && student.userId !== requestingUser.id) {
      throw new ForbiddenException('Access denied');
    }
    if (requestingUser?.role === 'PARENT') {
      const parent = await this.prisma.parent.findFirst({
        where: { userId: requestingUser.id, institutionId, deletedAt: null, isActive: true },
        select: { id: true },
      });
      if (!parent) throw new ForbiddenException('Parent profile not found');
      const link = await this.prisma.parentStudent.findFirst({
        where: { parentId: parent.id, studentId: student.id },
        select: { id: true },
      });
      if (!link) throw new ForbiddenException('Access denied');
    }

    const currentYear = await this.prisma.academicYear.findFirst({
      where: { institutionId, isCurrent: true },
    });

    const structure = await this.prisma.feeStructure.findFirst({
      where: { classId: student.classId, academicYearId: currentYear?.id, deletedAt: null },
      include: { items: { include: { feeHead: true } } },
    });

    if (!structure) return { student, dues: [], totalDue: 0 };

    const payments = await this.prisma.feePayment.findMany({
      where: { studentId: student.id, status: 'SUCCESS' },
      include: { feeHead: true },
    });

    const paidByHead: Record<string, number> = {};
    payments.forEach((p) => {
      paidByHead[p.feeHeadId] = (paidByHead[p.feeHeadId] ?? 0) + Number(p.amount);
    });

    // Apply concessions
    const concessions = await this.prisma.feeConcession.findMany({
      where: { studentId: student.id, isActive: true },
    });

    const dues = structure.items.map((item) => {
      const paid = paidByHead[item.feeHeadId] ?? 0;
      const concession = concessions.find((c) => c.feeHeadIds.includes(item.feeHeadId));
      let finalAmount = Number(item.amount);
      if (concession) {
        finalAmount =
          concession.concessionType === 'PERCENTAGE'
            ? finalAmount * (1 - Number(concession.value) / 100)
            : Math.max(0, finalAmount - Number(concession.value));
      }
      const due = Math.max(0, finalAmount - paid);
      return {
        feeHeadId: item.feeHeadId,
        feeHeadName: item.feeHead.name,
        totalAmount: finalAmount,
        paid,
        due,
        hasConcession: !!concession,
      };
    });

    const totalDue = dues.reduce((s, d) => s + d.due, 0);
    const totalPaid = dues.reduce((s, d) => s + d.paid, 0);

    return { student, dues, totalDue, totalPaid };
  }

  // ── Collect Payment ────────────────────────────────────────
  async collectFee(dto: CollectFeeDto, collectedById: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, institutionId } });
    if (!student) throw new NotFoundException('Student not found');

    const receiptNumber = await this.generateReceiptNumber(institutionId);

    const payments = await this.prisma.$transaction(
      dto.feeHeadIds.map((feeHeadId) =>
        this.prisma.feePayment.create({
          data: {
            studentId: dto.studentId,
            feeHeadId,
            amount: dto.amount / dto.feeHeadIds.length,
            paymentMode: dto.paymentMode,
            referenceNumber: dto.referenceNumber,
            remarks: dto.remarks,
            receiptNumber,
            collectedById,
            institutionId,
            status: 'SUCCESS',
            paidAt: new Date(),
          },
        }),
      ),
    );

    return { receiptNumber, payments, message: 'Payment recorded successfully' };
  }

  async initiateOnlinePayment(dto: InitiateOnlinePaymentDto, institutionId: string) {
    // Razorpay integration placeholder
    const orderId = `order_${Date.now()}`;
    await this.prisma.feePayment.create({
      data: {
        studentId: dto.studentId,
        feeHeadId: dto.feeHeadIds[0],
        amount: dto.amount,
        paymentMode: 'ONLINE',
        institutionId,
        status: 'PENDING',
        gatewayOrderId: orderId,
        receiptNumber: await this.generateReceiptNumber(institutionId),
      },
    });

    return {
      orderId,
      amount: dto.amount * 100, // paise for Razorpay
      currency: 'INR',
      keyId: this.config.get('RAZORPAY_KEY_ID'),
    };
  }

  async verifyOnlinePayment(gatewayOrderId: string, gatewayPaymentId: string) {
    // In real integration verify Razorpay signature here
    await this.prisma.feePayment.updateMany({
      where: { gatewayOrderId },
      data: { status: 'SUCCESS', gatewayPaymentId, paidAt: new Date() },
    });
    return { message: 'Payment verified' };
  }

  // ── Payment History ────────────────────────────────────────
  async getPaymentHistory(studentId: string, institutionId: string, requestingUser?: any) {
    const resolved = await this.prisma.student.findFirst({
      where: { institutionId, OR: [{ id: studentId }, { userId: studentId }] },
      select: { id: true, userId: true },
    });
    const sid = resolved?.id ?? studentId;

    if (resolved) {
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
    }

    return this.prisma.feePayment.findMany({
      where: { studentId: sid, institutionId },
      include: { feeHead: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDefaulters(institutionId: string, page = 1, limit = 20) {
    const { skip } = paginationParams({ page, limit });
    // Students with pending dues
    const students = await this.prisma.student.findMany({
      where: { institutionId, isActive: true, deletedAt: null },
      include: { class: true, section: true },
      skip,
      take: limit,
    });
    return students; // In production join with fee calculations
  }

  async applyConcession(dto: ConcessionDto, approvedById: string, institutionId: string) {
    return this.prisma.feeConcession.create({
      data: {
        studentId: dto.studentId,
        reason: dto.reason,
        concessionType: dto.concessionType,
        value: dto.value,
        feeHeadIds: dto.feeHeadIds,
        approvedById,
        institutionId,
        isActive: true,
      },
    });
  }

  private async generateReceiptNumber(institutionId: string): Promise<string> {
    const count = await this.prisma.feePayment.count({ where: { institutionId } });
    const year = new Date().getFullYear();
    return `RCP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
}
