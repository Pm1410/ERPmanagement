import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { StudentService } from './student.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto/student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('students')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get current student profile' })
  me(@CurrentUser('id') userId: string, @CurrentUser('institutionId') iid: string) {
    return this.studentService.findMe(userId, iid);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'FACULTY', 'HOD', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List all students (paginated, filtered)' })
  findAll(@Query() query: StudentQueryDto, @CurrentUser() user: any) {
    return this.studentService.findAll(query, user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'FACULTY', 'HOD', 'RECEPTIONIST', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get student by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.studentService.findOne(id, user);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create a new student' })
  create(@Body() dto: CreateStudentDto, @CurrentUser('institutionId') institutionId: string) {
    return this.studentService.create(dto, institutionId);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST', 'STUDENT')
  @ApiOperation({ summary: 'Update student details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser('institutionId') institutionId: string,
  ) {
    return this.studentService.update(id, dto, institutionId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a student (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('institutionId') institutionId: string) {
    return this.studentService.remove(id, institutionId);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document for a student' })
  uploadDocument(
    @Param('id') studentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('docType') docType: string,
    @CurrentUser('institutionId') institutionId: string,
  ) {
    return this.studentService.uploadDocument(studentId, file, docType, institutionId);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get student documents with signed S3 URLs' })
  getDocuments(@Param('id') studentId: string, @CurrentUser('institutionId') institutionId: string) {
    return this.studentService.getDocuments(studentId, institutionId);
  }
}
