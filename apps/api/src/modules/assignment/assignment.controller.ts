import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto, UpdateAssignmentDto, GradeSubmissionDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Module } from '@nestjs/common';

@ApiTags('assignments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post()
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Create an assignment' })
  create(
    @Body() dto: CreateAssignmentDto,
    @CurrentUser('id') facultyId: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.assignmentService.create(dto, facultyId, iid);
  }

  @Get()
  @ApiOperation({ summary: 'List assignments with filters' })
  findAll(
    @Query() query: { classId?: string; sectionId?: string; subjectId?: string; facultyId?: string; studentId?: string },
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.assignmentService.findAll(query, iid);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  findOne(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.assignmentService.findOne(id, iid);
  }

  @Put(':id')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL')
  @ApiOperation({ summary: 'Update an assignment' })
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto, @CurrentUser('institutionId') iid: string) {
    return this.assignmentService.update(id, dto, iid);
  }

  @Delete(':id')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Delete an assignment' })
  delete(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.assignmentService.delete(id, iid);
  }

  @Post(':id/submit')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit an assignment (file + text)' })
  submit(
    @Param('id') assignmentId: string,
    @CurrentUser('id') studentUserId: string,
    @CurrentUser('institutionId') iid: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('textContent') textContent?: string,
  ) {
    return this.assignmentService.submit(assignmentId, studentUserId, textContent, file, iid);
  }

  @Get(':id/submissions')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Get all submissions for an assignment' })
  getSubmissions(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.assignmentService.getSubmissions(id, iid);
  }

  @Put('submissions/:submissionId/grade')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL')
  @ApiOperation({ summary: 'Grade an assignment submission' })
  grade(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
    @CurrentUser('id') gradedById: string,
  ) {
    return this.assignmentService.gradeSubmission(submissionId, dto, gradedById);
  }
}
