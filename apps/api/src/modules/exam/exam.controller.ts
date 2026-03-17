import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExamService } from './exam.service';
import { CreateExamDto, UpdateExamDto, CreateExamScheduleDto, BulkMarksEntryDto } from './dto/exam.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('exams')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  @ApiOperation({ summary: 'List exams' })
  getExams(@CurrentUser('institutionId') iid: string, @Query('academicYearId') aYid?: string) {
    return this.examService.getExams(iid, aYid);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Create exam' })
  create(@Body() dto: CreateExamDto, @CurrentUser('institutionId') iid: string) {
    return this.examService.createExam(dto, iid);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Update exam' })
  update(@Param('id') id: string, @Body() dto: UpdateExamDto, @CurrentUser('institutionId') iid: string) {
    return this.examService.updateExam(id, dto, iid);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delete exam' })
  remove(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.examService.deleteExam(id, iid);
  }

  @Get(':examId/schedules')
  @ApiOperation({ summary: 'Get exam schedules' })
  getSchedules(@Param('examId') examId: string, @Query('classId') classId?: string) {
    return this.examService.getSchedules(examId, classId);
  }

  @Post('schedules')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD')
  @ApiOperation({ summary: 'Create exam schedule entry' })
  createSchedule(@Body() dto: CreateExamScheduleDto, @CurrentUser('institutionId') iid: string) {
    return this.examService.createSchedule(dto, iid);
  }

  @Post('marks')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Bulk marks entry for an exam schedule' })
  enterMarks(@Body() dto: BulkMarksEntryDto, @CurrentUser('id') facultyId: string) {
    return this.examService.bulkEnterMarks(dto, facultyId);
  }

  @Put('schedules/:id/finalize')
  @Roles('PRINCIPAL', 'INSTITUTION_ADMIN', 'HOD')
  @ApiOperation({ summary: 'Finalize marks — no further edits allowed' })
  finalizeMarks(@Param('id') id: string) {
    return this.examService.finalizeMarks(id);
  }

  @Get('results/student/:studentId')
  @Roles('STUDENT', 'PARENT', 'SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')
  @ApiOperation({ summary: 'Get results for a student' })
  getStudentResults(@Param('studentId') studentId: string, @Query('examId') examId?: string, @CurrentUser() user?: any) {
    return this.examService.getStudentResults(studentId, examId, user);
  }

  @Get('results/class')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Get class-wise results with ranking' })
  getClassResults(
    @Query('examId') examId: string,
    @Query('classId') classId: string,
    @Query('sectionId') sectionId: string,
  ) {
    return this.examService.getClassResults(examId, classId, sectionId);
  }
}
