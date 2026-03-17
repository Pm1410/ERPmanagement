import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  AssignStudentTransportDto,
  CreateRouteDto,
  CreateStopDto,
  CreateVehicleDto,
  UnassignStudentTransportDto,
  UpdateRouteDto,
  UpdateVehicleDto,
} from './dto/transport.dto';
import { TransportService } from './transport.service';

@ApiTags('transport')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('transport')
export class TransportController {
  constructor(private readonly transport: TransportService) {}

  @Get('vehicles')
  @ApiOperation({ summary: 'List transport vehicles' })
  listVehicles(@CurrentUser('institutionId') iid: string) {
    return this.transport.listVehicles(iid);
  }

  @Post('vehicles')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER')
  @ApiOperation({ summary: 'Create vehicle' })
  createVehicle(@Body() dto: CreateVehicleDto, @CurrentUser('institutionId') iid: string) {
    return this.transport.createVehicle(dto, iid);
  }

  @Put('vehicles/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER')
  @ApiOperation({ summary: 'Update vehicle' })
  updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentUser('institutionId') iid: string) {
    return this.transport.updateVehicle(id, dto, iid);
  }

  @Delete('vehicles/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delete vehicle' })
  deleteVehicle(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.transport.deleteVehicle(id, iid);
  }

  @Get('routes')
  @ApiOperation({ summary: 'List routes with stops' })
  listRoutes(@CurrentUser('institutionId') iid: string) {
    return this.transport.listRoutes(iid);
  }

  @Post('routes')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER')
  @ApiOperation({ summary: 'Create route' })
  createRoute(@Body() dto: CreateRouteDto, @CurrentUser('institutionId') iid: string) {
    return this.transport.createRoute(dto, iid);
  }

  @Put('routes/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER')
  @ApiOperation({ summary: 'Update route' })
  updateRoute(@Param('id') id: string, @Body() dto: UpdateRouteDto, @CurrentUser('institutionId') iid: string) {
    return this.transport.updateRoute(id, dto, iid);
  }

  @Delete('routes/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delete route' })
  deleteRoute(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.transport.deleteRoute(id, iid);
  }

  @Post('stops')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER')
  @ApiOperation({ summary: 'Add stop to route' })
  addStop(@Body() dto: CreateStopDto, @CurrentUser('institutionId') iid: string) {
    return this.transport.addStop(dto, iid);
  }

  @Get('assignments')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER', 'RECEPTIONIST', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'List student transport assignments' })
  listAssignments(
    @CurrentUser('institutionId') iid: string,
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
  ) {
    // Parents/Students can only see a single student's assignment if provided; otherwise return none.
    const isAdmin = ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER', 'RECEPTIONIST'].includes(user?.role);
    if (!isAdmin && !studentId) return [];
    return this.transport.listAssignments(iid, status, studentId, user);
  }

  @Post('assign')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Assign student to route/stop' })
  assign(@Body() dto: AssignStudentTransportDto, @CurrentUser('institutionId') iid: string) {
    return this.transport.assignStudent(dto, iid);
  }

  @Post('unassign')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'TRANSPORT_MANAGER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Unassign student (deactivate assignment)' })
  unassign(@Body() dto: UnassignStudentTransportDto, @CurrentUser('institutionId') iid: string) {
    return this.transport.unassignStudent(dto, iid);
  }
}

