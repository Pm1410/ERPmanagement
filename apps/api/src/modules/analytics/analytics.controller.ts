import {
  Controller, Get, Post, Delete, Query, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { DashboardsService } from './dashboards.service';
import { ReportBuilderService } from './report-builder.service';
import {
  AttendanceTrendsDto, ExamPerformanceDto, FeeCollectionDto,
  AtRiskDto, CustomReportDto, ScheduleReportDto,
  SubjectPerformanceDto, LibraryUtilizationDto,
} from './dto/analytics.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD', 'ACCOUNTANT', 'HR_MANAGER')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly dashboardsService: DashboardsService,
    private readonly reportBuilderService: ReportBuilderService,
  ) {}

  // ── Core KPIs ──────────────────────────────────────────────
  @Get('dashboard-kpis')
  @ApiOperation({ summary: 'Executive dashboard KPI cards' })
  getDashboardKpis(@CurrentUser('institutionId') iid: string) {
    return this.analyticsService.getDashboardKpis(iid);
  }

  @Get('attendance-trends')
  @ApiOperation({ summary: 'Daily attendance trend (WEEK / MONTH / YEAR)' })
  getAttendanceTrends(@CurrentUser('institutionId') iid: string, @Query() q: AttendanceTrendsDto) {
    return this.analyticsService.getAttendanceTrends(iid, q.classId, q.range);
  }

  @Get('exam-performance')
  @ApiOperation({ summary: 'Exam performance — pass rate, grade distribution' })
  getExamPerformance(@CurrentUser('institutionId') iid: string, @Query() q: ExamPerformanceDto) {
    return this.analyticsService.getExamPerformance(iid, q.classId, q.examId);
  }

  @Get('fee-collection')
  @ApiOperation({ summary: 'Monthly fee collection stats for a year' })
  getFeeCollectionStats(@CurrentUser('institutionId') iid: string, @Query() q: FeeCollectionDto) {
    return this.analyticsService.getFeeCollectionStats(iid, q.year);
  }

  @Get('admissions-funnel')
  @ApiOperation({ summary: 'Enquiry → Application → Enrolled funnel' })
  getAdmissionsFunnel(@CurrentUser('institutionId') iid: string, @Query('academicYear') ay?: string) {
    return this.analyticsService.getAdmissionsFunnel(iid, ay);
  }

  @Get('at-risk-students')
  @ApiOperation({ summary: 'Students flagged: low attendance OR low marks' })
  getAtRiskStudents(@CurrentUser('institutionId') iid: string, @Query() q: AtRiskDto) {
    return this.analyticsService.getAtRiskStudents(iid, q.attendanceThreshold, q.marksThreshold);
  }

  @Get('subject-performance')
  @ApiOperation({ summary: 'Subject-wise average, pass rate, highest/lowest marks' })
  getSubjectPerformance(@CurrentUser('institutionId') iid: string, @Query() q: SubjectPerformanceDto) {
    return this.analyticsService.getSubjectPerformance(iid, q);
  }

  @Get('year-over-year/fees')
  @ApiOperation({ summary: 'Year-over-year fee collection comparison' })
  getYoyFees(@CurrentUser('institutionId') iid: string) {
    return this.analyticsService.getYearOverYearFees(iid);
  }

  @Get('year-over-year/attendance')
  @ApiOperation({ summary: 'Year-over-year attendance comparison' })
  getYoyAttendance(@CurrentUser('institutionId') iid: string) {
    return this.analyticsService.getYearOverYearAttendance(iid);
  }

  @Get('library-utilization')
  @ApiOperation({ summary: 'Library issue/return/fine stats by month' })
  getLibraryUtilization(@CurrentUser('institutionId') iid: string, @Query() q: LibraryUtilizationDto) {
    return this.analyticsService.getLibraryUtilization(iid, q);
  }

  // ── Pre-built Dashboards ───────────────────────────────────
  @Get('dashboards/academic')
  @ApiOperation({ summary: 'Academic performance dashboard (pass/fail, top/bottom students, grade dist)' })
  getAcademicDashboard(
    @CurrentUser('institutionId') iid: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.dashboardsService.getAcademicDashboard(iid, academicYearId);
  }

  @Get('dashboards/financial')
  @ApiOperation({ summary: 'Financial dashboard (collection, defaulters, fee-head breakdown)' })
  getFinancialDashboard(@CurrentUser('institutionId') iid: string, @Query('year') year?: number) {
    return this.dashboardsService.getFinancialDashboard(iid, year);
  }

  @Get('dashboards/operational')
  @ApiOperation({ summary: 'Operational dashboard (attendance, library, grievances, hostel)' })
  getOperationalDashboard(@CurrentUser('institutionId') iid: string) {
    return this.dashboardsService.getOperationalDashboard(iid);
  }

  // ── Custom Report Builder ──────────────────────────────────
  @Post('reports/run')
  @ApiOperation({ summary: 'Run a custom report — returns JSON or queues CSV/Excel/PDF export' })
  runReport(
    @Body() dto: CustomReportDto,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.reportBuilderService.runReport(dto, iid);
  }

  @Post('reports/schedule')
  @ApiOperation({ summary: 'Schedule a recurring report (cron + email delivery)' })
  scheduleReport(
    @Body() dto: ScheduleReportDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.reportBuilderService.scheduleReport(dto, userId, iid);
  }

  @Get('reports/scheduled')
  @ApiOperation({ summary: 'List scheduled reports for institution' })
  getScheduledReports(@CurrentUser('institutionId') iid: string) {
    return this.reportBuilderService.getScheduledReports(iid);
  }

  @Delete('reports/scheduled/:id')
  @ApiOperation({ summary: 'Delete / disable a scheduled report' })
  deleteScheduledReport(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.reportBuilderService.deleteScheduledReport(id, iid);
  }

  @Get('reports/exports')
  @ApiOperation({ summary: 'Get export history (download links)' })
  getExportHistory(@CurrentUser('institutionId') iid: string) {
    return this.reportBuilderService.getExportHistory(iid);
  }
}
