import {
  Controller, Get, Post, Put, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GrievanceService } from './grievance.service';
import { CreateGrievanceDto, UpdateGrievanceDto } from './dto/grievance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('grievances')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('grievances')
export class GrievanceController {
  constructor(private readonly grievanceService: GrievanceService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a grievance' })
  create(
    @Body() dto: CreateGrievanceDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.grievanceService.create(dto, userId, iid);
  }

  @Get()
  @ApiOperation({ summary: 'List grievances with filters' })
  findAll(
    @Query() query: { status?: string; category?: string; assignedToId?: string; raisedByUserId?: string },
    @CurrentUser() user: any,
    @CurrentUser('institutionId') iid: string,
  ) {
    const managementRoles = ['PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN', 'HOD'];
    const raisedByUserId = managementRoles.includes(user?.role) ? query.raisedByUserId : user?.id;
    return this.grievanceService.findAll({ ...query, raisedByUserId }, iid);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grievance by ID' })
  findOne(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.grievanceService.findOne(id, iid);
  }

  @Put(':id')
  @Roles('PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN', 'HOD')
  @ApiOperation({ summary: 'Update grievance status / assign / resolve' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGrievanceDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.grievanceService.update(id, dto, userId, iid);
  }
}
