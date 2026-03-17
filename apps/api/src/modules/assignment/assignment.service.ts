import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3Service } from '../../common/storage/s3.service';
import { CreateAssignmentDto, UpdateAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async create(dto: CreateAssignmentDto, facultyId: string, institutionId: string) {
    return this.prisma.assignment.create({
      data: { ...dto, facultyId, institutionId, dueDate: new Date(dto.dueDate) },
    });
  }

  async findAll(
    query: { classId?: string; sectionId?: string; subjectId?: string; facultyId?: string; studentId?: string },
    institutionId: string,
  ) {
    const where: Record<string, unknown> = { institutionId, deletedAt: null };

    // If studentId is provided, treat it as either Student.id or User.id and filter to the student's class/section.
    // This keeps student portal pages simple (they only know the logged-in User id by default).
    let includeSubmissionsForStudentId: string | undefined;
    if (query.studentId) {
      const student = await this.prisma.student.findFirst({
        where: {
          institutionId,
          deletedAt: null,
          OR: [{ id: query.studentId }, { userId: query.studentId }],
        },
        select: { id: true, classId: true, sectionId: true },
      });
      if (student) {
        where.classId = student.classId;
        where.sectionId = student.sectionId;
        includeSubmissionsForStudentId = student.id;
      }
    }

    // If facultyId is provided, allow passing either Faculty.id or User.id.
    if (query.facultyId) {
      const faculty = await this.prisma.faculty.findFirst({
        where: { institutionId, deletedAt: null, OR: [{ id: query.facultyId }, { userId: query.facultyId }] },
        select: { id: true },
      });
      if (faculty) where.facultyId = faculty.id;
    }

    Object.entries(query).forEach(([k, v]) => {
      if (!v) return;
      if (k === 'studentId') return;
      if (k === 'facultyId') return;
      where[k] = v;
    });

    return this.prisma.assignment.findMany({
      where,
      include: {
        subject: { select: { name: true } },
        faculty: { select: { name: true } },
        _count: { select: { submissions: true } },
        submissions: includeSubmissionsForStudentId
          ? {
              where: { studentId: includeSubmissionsForStudentId },
              select: { id: true, submittedAt: true, status: true, marksObtained: true, gradedAt: true },
            }
          : false,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string, institutionId: string) {
    const a = await this.prisma.assignment.findFirst({
      where: { id, institutionId, deletedAt: null },
      include: { subject: true, faculty: { select: { name: true } } },
    });
    if (!a) throw new NotFoundException('Assignment not found');
    return a;
  }

  async update(id: string, dto: UpdateAssignmentDto, institutionId: string) {
    await this.findOne(id, institutionId);
    return this.prisma.assignment.update({
      where: { id },
      data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
    });
  }

  async delete(id: string, institutionId: string) {
    await this.findOne(id, institutionId);
    await this.prisma.assignment.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Assignment deleted' };
  }

  async submit(
    assignmentId: string,
    studentUserId: string,
    textContent: string | undefined,
    file: Express.Multer.File | undefined,
    institutionId: string,
  ) {
    const assignment = await this.findOne(assignmentId, institutionId);

    const student = await this.prisma.student.findFirst({
      where: { userId: studentUserId, institutionId, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    if (new Date() > assignment.dueDate) {
      throw new BadRequestException('Submission deadline has passed');
    }

    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { assignmentId, studentId: student.id },
    });
    if (existing) throw new BadRequestException('Already submitted');

    let fileKey: string | undefined;
    let fileUrl: string | undefined;
    if (file) {
      const upload = await this.s3.upload(file.buffer, file.originalname, `assignments/${assignmentId}`, file.mimetype);
      fileKey = upload.key;
      fileUrl = upload.url;
    }

    return this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: student.id,
        textContent,
        fileKey, fileUrl, submittedAt: new Date(), status: 'SUBMITTED',
      },
    });
  }

  async getSubmissions(assignmentId: string, institutionId: string) {
    await this.findOne(assignmentId, institutionId);
    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: { student: { select: { name: true, rollNumber: true } } },
      orderBy: { submittedAt: 'asc' },
    });

    // Refresh signed URLs
    return Promise.all(
      submissions.map(async (s) => ({
        ...s,
        fileUrl: s.fileKey ? await this.s3.getSignedUrl(s.fileKey) : null,
      })),
    );
  }

  async gradeSubmission(submissionId: string, dto: GradeSubmissionDto, gradedById: string) {
    const submission = await this.prisma.assignmentSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new NotFoundException('Submission not found');

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marksObtained: dto.marksObtained,
        feedback: dto.feedback,
        status: 'GRADED',
        gradedById,
        gradedAt: new Date(),
      },
    });
  }
}
