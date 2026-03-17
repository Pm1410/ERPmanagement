import {
  Controller, Get, Post, Put, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, AttendanceQueryDto, LeaveRequestDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('attendance')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Mark attendance for a class/subject/date' })
  mark(@Body() dto: MarkAttendanceDto, @CurrentUser('id') facultyId: string) {
    return this.attendanceService.markAttendance(dto, facultyId);
  }

  @Get()
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get attendance records with filters' })
  getAttendance(@Query() query: AttendanceQueryDto, @CurrentUser('institutionId') iid: string) {
    return this.attendanceService.getAttendance(query, iid);
  }

  @Get('student/:studentId/summary')
  @Roles('STUDENT', 'PARENT', 'SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')
  @ApiOperation({ summary: 'Get attendance summary for a student' })
  getStudentSummary(
    @Param('studentId') studentId: string,
    @Query('month') month?: string,
    @CurrentUser() user?: any,
  ) {
    return this.attendanceService.getStudentAttendanceSummary(studentId, month, user);
  }

  @Get('report/monthly')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'Monthly attendance report for a class/section' })
  getMonthlyReport(
    @Query('classId') classId: string,
    @Query('sectionId') sectionId: string,
    @Query('month') month: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.attendanceService.getMonthlyReport(classId, sectionId, month, iid);
  }

  @Post('leave')
  @ApiOperation({ summary: 'Submit a leave request' })
  applyLeave(@Body() dto: LeaveRequestDto, @CurrentUser('institutionId') iid: string) {
    return this.attendanceService.applyLeave(dto, iid);
  }

  @Get('leave')
  @ApiOperation({ summary: 'Get leave requests' })
  getLeaves(@Query('studentId') studentId?: string, @Query('status') status?: string) {
    return this.attendanceService.getLeaveRequests(studentId, status);
  }

  @Put('leave/:id/approve')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL')
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  approveLeave(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; remarks?: string },
    @CurrentUser('id') approverId: string,
  ) {
    return this.attendanceService.updateLeaveStatus(id, body.status, approverId, body.remarks);
  }
}
