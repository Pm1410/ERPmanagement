import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdmissionsService } from './admissions.service';
import {
  CreateAdmissionApplicationDto,
  CreateAdmissionEnquiryDto,
  UpdateAdmissionApplicationDto,
  UpdateAdmissionEnquiryDto,
} from './dto/admissions.dto';

@ApiTags('admissions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissions: AdmissionsService) {}

  @Get('enquiries')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List admission enquiries' })
  listEnquiries(
    @CurrentUser('institutionId') iid: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.admissions.listEnquiries(iid, status, search);
  }

  @Post('enquiries')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create admission enquiry' })
  createEnquiry(@Body() dto: CreateAdmissionEnquiryDto, @CurrentUser('institutionId') iid: string) {
    return this.admissions.createEnquiry(dto, iid);
  }

  @Put('enquiries/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Update admission enquiry' })
  updateEnquiry(
    @Param('id') id: string,
    @Body() dto: UpdateAdmissionEnquiryDto,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.admissions.updateEnquiry(id, dto, iid);
  }

  @Get('applications')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List admission applications' })
  listApplications(
    @CurrentUser('institutionId') iid: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.admissions.listApplications(iid, status, search);
  }

  @Post('applications')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create admission application' })
  createApplication(
    @Body() dto: CreateAdmissionApplicationDto,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.admissions.createApplication(dto, iid);
  }

  @Put('applications/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Update admission application' })
  updateApplication(
    @Param('id') id: string,
    @Body() dto: UpdateAdmissionApplicationDto,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.admissions.updateApplication(id, dto, iid);
  }
}

