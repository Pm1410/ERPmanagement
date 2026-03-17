import {
  Controller, Get, Post, Put, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeeService } from './fee.service';
import {
  CreateFeeStructureDto, CollectFeeDto, InitiateOnlinePaymentDto, ConcessionDto, FeeHeadDto,
} from './dto/fee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('fees')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('fees')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Get('heads')
  @ApiOperation({ summary: 'List fee heads' })
  getFeeHeads(@CurrentUser('institutionId') iid: string) {
    return this.feeService.getFeeHeads(iid);
  }

  @Post('heads')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Create fee head' })
  createFeeHead(@Body() dto: FeeHeadDto, @CurrentUser('institutionId') iid: string) {
    return this.feeService.createFeeHead(dto, iid);
  }

  @Get('structure')
  @ApiOperation({ summary: 'Get fee structure for class/year' })
  getFeeStructure(@Query('classId') classId: string, @Query('academicYearId') academicYearId: string) {
    return this.feeService.getFeeStructure(classId, academicYearId);
  }

  @Post('structure')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Create fee structure' })
  createFeeStructure(@Body() dto: CreateFeeStructureDto, @CurrentUser('institutionId') iid: string) {
    return this.feeService.createFeeStructure(dto, iid);
  }

  @Get('student/:studentId/dues')
  @Roles('STUDENT', 'PARENT', 'SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get student fee dues' })
  getStudentDues(@Param('studentId') studentId: string, @CurrentUser() user: any) {
    return this.feeService.getStudentDues(studentId, user.institutionId, user);
  }

  @Get('student/:studentId/history')
  @Roles('STUDENT', 'PARENT', 'SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get student payment history' })
  getHistory(@Param('studentId') studentId: string, @CurrentUser() user: any) {
    return this.feeService.getPaymentHistory(studentId, user.institutionId, user);
  }

  @Post('collect')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ACCOUNTANT', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Collect fee payment (cash/cheque/offline)' })
  collectFee(
    @Body() dto: CollectFeeDto,
    @CurrentUser('id') collectedById: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.feeService.collectFee(dto, collectedById, iid);
  }

  @Post('pay-online')
  @ApiOperation({ summary: 'Initiate online payment (Razorpay order)' })
  initiateOnlinePayment(@Body() dto: InitiateOnlinePaymentDto, @CurrentUser('institutionId') iid: string) {
    return this.feeService.initiateOnlinePayment(dto, iid);
  }

  @Post('pay-online/verify')
  @ApiOperation({ summary: 'Verify Razorpay payment callback' })
  verifyPayment(@Body() body: { gatewayOrderId: string; gatewayPaymentId: string }) {
    return this.feeService.verifyOnlinePayment(body.gatewayOrderId, body.gatewayPaymentId);
  }

  @Get('defaulters')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ACCOUNTANT', 'PRINCIPAL')
  @ApiOperation({ summary: 'Get fee defaulters list' })
  getDefaulters(
    @CurrentUser('institutionId') iid: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.feeService.getDefaulters(iid, page, limit);
  }

  @Post('concession')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Apply fee concession to a student' })
  applyConcession(
    @Body() dto: ConcessionDto,
    @CurrentUser('id') approvedById: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.feeService.applyConcession(dto, approvedById, iid);
  }
}
