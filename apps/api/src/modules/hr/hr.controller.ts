import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HrService } from './hr.service';
import { ApplyLeaveDto, ApproveLeaveDto, SetPayrollConfigDto, RunPayrollDto } from './dto/hr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('hr')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ── Leaves ─────────────────────────────────────────────────
  @Post('leaves')
  @ApiOperation({ summary: 'Apply for leave (staff)' })
  applyLeave(
    @Body() dto: ApplyLeaveDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.hrService.applyLeave(dto, userId, iid);
  }

  @Get('leaves')
  @ApiOperation({ summary: 'Get leave requests (admin sees all, staff sees own)' })
  getLeaves(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    const isAdmin = ['INSTITUTION_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'HR_MANAGER'].includes(user.role);
    return this.hrService.getLeaves({
      staffUserId: isAdmin ? undefined : user.id,
      status,
      institutionId: user.institutionId,
    });
  }

  @Put('leaves/:id/approve')
  @Roles('PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER', 'HOD')
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  approveLeave(
    @Param('id') id: string,
    @Body() dto: ApproveLeaveDto,
    @CurrentUser('id') approverId: string,
  ) {
    return this.hrService.approveLeave(id, dto, approverId);
  }

  @Get('leaves/balance/:staffId')
  @ApiOperation({ summary: 'Get leave balance for a staff member' })
  getLeaveBalance(@Param('staffId') staffId: string) {
    return this.hrService.getLeaveBalance(staffId);
  }

  // ── Payroll ────────────────────────────────────────────────
  @Post('payroll/config')
  @Roles('INSTITUTION_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Set payroll config for a staff member' })
  setPayrollConfig(@Body() dto: SetPayrollConfigDto, @CurrentUser('institutionId') iid: string) {
    return this.hrService.setPayrollConfig(dto, iid);
  }

  @Get('payroll/config/:staffId')
  @Roles('INSTITUTION_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER', 'FACULTY')
  @ApiOperation({ summary: 'Get payroll config for a staff member' })
  getPayrollConfig(@Param('staffId') staffId: string) {
    return this.hrService.getPayrollConfig(staffId);
  }

  @Post('payroll/run')
  @Roles('INSTITUTION_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Trigger monthly payroll run (async job)' })
  runPayroll(@Body() dto: RunPayrollDto, @CurrentUser('institutionId') iid: string) {
    return this.hrService.runPayroll(dto, iid);
  }

  @Get('payroll/slips')
  @ApiOperation({ summary: 'Get payslips' })
  getPayslips(
    @CurrentUser() user: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('staffId') staffId?: string,
  ) {
    const isAdmin = ['INSTITUTION_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'].includes(user.role);
    return this.hrService.getPayslips(
      { staffId: isAdmin ? staffId : user.id, month, year },
      user.institutionId,
    );
  }

  @Get('payroll/slips/:id')
  @ApiOperation({ summary: 'Get a single payslip' })
  getPayslip(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.hrService.getPayslipById(id, iid);
  }

  // ── Holidays ───────────────────────────────────────────────
  @Get('holidays')
  @ApiOperation({ summary: 'Get holiday calendar' })
  getHolidays(@CurrentUser('institutionId') iid: string, @Query('year') year?: number) {
    return this.hrService.getHolidays(iid, year);
  }

  @Post('holidays')
  @Roles('INSTITUTION_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Add a holiday' })
  addHoliday(
    @Body() body: { name: string; date: string; type: string },
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.hrService.addHoliday(body, iid);
  }

  @Delete('holidays/:id')
  @Roles('INSTITUTION_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Remove a holiday' })
  deleteHoliday(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.hrService.deleteHoliday(id, iid);
  }
}
