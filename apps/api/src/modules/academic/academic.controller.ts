import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AcademicService } from './academic.service';
import {
  CreateAcademicYearDto, UpdateAcademicYearDto,
  CreateClassDto, UpdateClassDto,
  CreateSectionDto, UpdateSectionDto,
  CreateSubjectDto, UpdateSubjectDto,
  SaveTimetableDto,
} from './dto/academic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('academic')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // ── Academic Years ─────────────────────────────────────────
  @Get('years')
  @ApiOperation({ summary: 'List academic years' })
  getYears(@CurrentUser('institutionId') iid: string) {
    return this.academicService.getAcademicYears(iid);
  }

  @Post('years')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Create academic year' })
  createYear(@Body() dto: CreateAcademicYearDto, @CurrentUser('institutionId') iid: string) {
    return this.academicService.createAcademicYear(dto, iid);
  }

  @Put('years/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Update academic year' })
  updateYear(@Param('id') id: string, @Body() dto: UpdateAcademicYearDto, @CurrentUser('institutionId') iid: string) {
    return this.academicService.updateAcademicYear(id, dto, iid);
  }

  @Put('years/:id/set-current')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Set current academic year' })
  setCurrentYear(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.academicService.setCurrentAcademicYear(id, iid);
  }

  // ── Classes ────────────────────────────────────────────────
  @Get('classes')
  @ApiOperation({ summary: 'List classes for an academic year' })
  getClasses(@Query('academicYearId') academicYearId: string, @CurrentUser('institutionId') iid: string) {
    return this.academicService.getClasses(academicYearId, iid);
  }

  @Post('classes')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Create a class' })
  createClass(@Body() dto: CreateClassDto, @CurrentUser('institutionId') iid: string) {
    return this.academicService.createClass(dto, iid);
  }

  @Put('classes/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Update a class' })
  updateClass(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.academicService.updateClass(id, dto);
  }

  @Delete('classes/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delete a class' })
  deleteClass(@Param('id') id: string) {
    return this.academicService.deleteClass(id);
  }

  // ── Sections ───────────────────────────────────────────────
  @Get('classes/:classId/sections')
  @ApiOperation({ summary: 'List sections for a class' })
  getSections(@Param('classId') classId: string) {
    return this.academicService.getSections(classId);
  }

  @Post('sections')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Create a section' })
  createSection(@Body() dto: CreateSectionDto) {
    return this.academicService.createSection(dto);
  }

  @Put('sections/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Update a section' })
  updateSection(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.academicService.updateSection(id, dto);
  }

  // ── Subjects ───────────────────────────────────────────────
  @Get('classes/:classId/subjects')
  @ApiOperation({ summary: 'List subjects for a class' })
  getSubjects(@Param('classId') classId: string) {
    return this.academicService.getSubjects(classId);
  }

  @Post('subjects')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD')
  @ApiOperation({ summary: 'Create a subject' })
  createSubject(@Body() dto: CreateSubjectDto, @CurrentUser('institutionId') iid: string) {
    return this.academicService.createSubject(dto, iid);
  }

  @Put('subjects/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD')
  @ApiOperation({ summary: 'Update a subject' })
  updateSubject(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.academicService.updateSubject(id, dto);
  }

  @Delete('subjects/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delete a subject' })
  deleteSubject(@Param('id') id: string) {
    return this.academicService.deleteSubject(id);
  }

  // ── Timetable ──────────────────────────────────────────────
  @Post('timetable')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD')
  @ApiOperation({ summary: 'Save/replace timetable for a class-section' })
  saveTimetable(@Body() dto: SaveTimetableDto, @CurrentUser('institutionId') iid: string) {
    return this.academicService.saveTimetable(dto, iid);
  }

  @Get('timetable')
  @ApiOperation({ summary: 'Get timetable for class/section' })
  getTimetable(
    @Query('classId') classId: string,
    @Query('sectionId') sectionId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.academicService.getTimetable(classId, sectionId, academicYearId);
  }
}
