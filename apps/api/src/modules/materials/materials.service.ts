import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3Service } from '../../common/storage/s3.service';
import { CreateMaterialDto, MaterialQueryDto } from './dto/materials.dto';

@Injectable()
export class MaterialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async create(
    dto: CreateMaterialDto,
    file: Express.Multer.File | undefined,
    user: { id: string; role: string; institutionId: string },
  ) {
    if (!file) throw new NotFoundException('File is required');

    // Optional: try to map user → faculty (for easier filtering)
    const faculty = await this.prisma.faculty.findFirst({
      where: { userId: user.id, institutionId: user.institutionId, deletedAt: null, isActive: true },
      select: { id: true },
    });

    const upload = await this.s3.upload(
      file.buffer,
      file.originalname,
      `materials/${user.institutionId}/${dto.classId}`,
      file.mimetype,
    );

    return this.prisma.studyMaterial.create({
      data: {
        institutionId: user.institutionId,
        uploadedById: user.id,
        facultyId: faculty?.id,
        title: dto.title,
        description: dto.description,
        classId: dto.classId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        fileName: file.originalname,
        fileKey: upload.key,
        fileUrl: upload.url,
      },
      include: { class: true, section: true, subject: true, uploadedBy: { select: { name: true } } },
    });
  }

  async findAll(query: MaterialQueryDto, user: { id: string; role: string; institutionId: string }) {
    const where: Record<string, unknown> = {
      institutionId: user.institutionId,
      deletedAt: null,
      isActive: true,
    };
    if (query.classId) where.classId = query.classId;
    if (query.sectionId) where.sectionId = query.sectionId;
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.uploadedById) where.uploadedById = query.uploadedById;

    const items = await this.prisma.studyMaterial.findMany({
      where,
      include: { class: true, section: true, subject: true, uploadedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Refresh signed URLs
    return Promise.all(items.map(async (m) => ({
      ...m,
      fileUrl: m.fileKey ? await this.s3.getSignedUrl(m.fileKey) : m.fileUrl,
    })));
  }

  async remove(id: string, user: { id: string; role: string; institutionId: string }) {
    const m = await this.prisma.studyMaterial.findFirst({ where: { id, institutionId: user.institutionId } });
    if (!m) throw new NotFoundException('Material not found');

    const isAdmin = ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD'].includes(user.role);
    if (!isAdmin && m.uploadedById !== user.id) throw new ForbiddenException('Access denied');

    await this.prisma.studyMaterial.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'Material deleted' };
  }
}

