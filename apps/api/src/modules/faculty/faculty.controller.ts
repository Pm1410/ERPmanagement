import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto, UpdateFacultyDto, FacultyQueryDto, AssignSubjectDto } from './dto/faculty.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('faculty')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get('me')
  @Roles('FACULTY', 'HOD')
  @ApiOperation({ summary: 'Get current faculty profile' })
  me(@CurrentUser('id') userId: string, @CurrentUser('institutionId') iid: string) {
    return this.facultyService.findMe(userId, iid);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD')
  @ApiOperation({ summary: 'List all faculty' })
  findAll(@Query() query: FacultyQueryDto, @CurrentUser('institutionId') iid: string) {
    return this.facultyService.findAll(query, iid);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get faculty by ID' })
  findOne(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.facultyService.findOne(id, iid);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Create faculty member' })
  create(@Body() dto: CreateFacultyDto, @CurrentUser('institutionId') iid: string) {
    return this.facultyService.create(dto, iid);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'FACULTY')
  @ApiOperation({ summary: 'Update faculty member' })
  update(@Param('id') id: string, @Body() dto: UpdateFacultyDto, @CurrentUser('institutionId') iid: string) {
    return this.facultyService.update(id, dto, iid);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Deactivate faculty member' })
  remove(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.facultyService.remove(id, iid);
  }

  @Post(':id/assign-subjects')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD')
  @ApiOperation({ summary: 'Assign subjects to faculty' })
  assignSubjects(@Param('id') id: string, @Body() dto: AssignSubjectDto, @CurrentUser('institutionId') iid: string) {
    return this.facultyService.assignSubjects(id, dto, iid);
  }

  @Get(':id/timetable')
  @ApiOperation({ summary: 'Get faculty timetable' })
  getTimetable(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.facultyService.getTimetable(id, iid);
  }
}
