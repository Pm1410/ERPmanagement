import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { paginated, paginationParams } from '../../common/utils/response.util';
import { CreateBookDto, UpdateBookDto, IssueBookDto, ReturnBookDto, BookQueryDto } from './dto/library.dto';

const DEFAULT_LOAN_DAYS = 14;
const FINE_PER_DAY = 2; // ₹2 per day

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getBooks(query: BookQueryDto, institutionId: string) {
    const { page, limit, skip } = paginationParams(query);
    const where: Record<string, unknown> = { institutionId, deletedAt: null };
    if (query.category) where.category = query.category;
    if (query.availability === 'AVAILABLE') where.availableCopies = { gt: 0 };
    if (query.availability === 'ISSUED') where.availableCopies = 0;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { author: { contains: query.search, mode: 'insensitive' } },
        { isbn: { contains: query.search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.book.findMany({ where, skip, take: limit, orderBy: { title: 'asc' } }),
      this.prisma.book.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async createBook(dto: CreateBookDto, institutionId: string) {
    return this.prisma.book.create({
      data: { ...dto, institutionId, availableCopies: dto.totalCopies },
    });
  }

  async updateBook(id: string, dto: UpdateBookDto, institutionId: string) {
    const book = await this.prisma.book.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!book) throw new NotFoundException('Book not found');
    return this.prisma.book.update({ where: { id }, data: dto });
  }

  async deleteBook(id: string, institutionId: string) {
    const book = await this.prisma.book.findFirst({ where: { id, institutionId, deletedAt: null } });
    if (!book) throw new NotFoundException('Book not found');
    if (book.availableCopies < book.totalCopies) {
      throw new BadRequestException('Cannot delete book with active issues');
    }
    await this.prisma.book.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Book deleted' };
  }

  async issueBook(dto: IssueBookDto, issuedById: string, institutionId: string) {
    const book = await this.prisma.book.findFirst({ where: { id: dto.bookId, institutionId, deletedAt: null } });
    if (!book) throw new NotFoundException('Book not found');
    if (book.availableCopies < 1) throw new BadRequestException('No copies available');

    const existing = await this.prisma.bookIssue.findFirst({
      where: { bookId: dto.bookId, studentId: dto.studentId, returnedAt: null },
    });
    if (existing) throw new BadRequestException('Student already has this book');

    const dueDate = dto.dueDate
      ? new Date(dto.dueDate)
      : new Date(Date.now() + DEFAULT_LOAN_DAYS * 86400000);

    return this.prisma.$transaction(async (tx) => {
      const issue = await tx.bookIssue.create({
        data: { bookId: dto.bookId, studentId: dto.studentId, issuedById, dueDate, institutionId },
      });
      await tx.book.update({ where: { id: dto.bookId }, data: { availableCopies: { decrement: 1 } } });
      return issue;
    });
  }

  async returnBook(dto: ReturnBookDto, returnedById: string) {
    const issue = await this.prisma.bookIssue.findUnique({
      where: { id: dto.issueId },
      include: { book: true },
    });
    if (!issue) throw new NotFoundException('Issue record not found');
    if (issue.returnedAt) throw new BadRequestException('Book already returned');

    const now = new Date();
    const fine = this.calculateFine(issue.dueDate, now);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bookIssue.update({
        where: { id: dto.issueId },
        data: { returnedAt: now, returnCondition: dto.condition, fine, returnedById },
      });
      await tx.book.update({ where: { id: issue.bookId }, data: { availableCopies: { increment: 1 } } });
      return { ...updated, fineAmount: fine };
    });
  }

  async getIssuedBooks(studentId: string, requestingUser?: any) {
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
    return this.prisma.bookIssue.findMany({
      where: { studentId: sid, returnedAt: null },
      include: { book: { select: { title: true, author: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getIssueHistory(studentId?: string, institutionId?: string) {
    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = studentId;
    if (institutionId) where.institutionId = institutionId;
    return this.prisma.bookIssue.findMany({
      where,
      include: { book: { select: { title: true, author: true } }, student: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  private calculateFine(dueDate: Date, returnDate: Date): number {
    const overdueDays = Math.max(0, Math.floor((returnDate.getTime() - dueDate.getTime()) / 86400000));
    return overdueDays * FINE_PER_DAY;
  }
}
