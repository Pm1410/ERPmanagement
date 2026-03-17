import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HostelService } from './hostel.service';
import { AllocateHostelDto, CreateHostelRoomDto, UpdateHostelRoomDto, VacateHostelDto } from './dto/hostel.dto';

@ApiTags('hostel')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'List hostel rooms' })
  listRooms(@CurrentUser('institutionId') iid: string) {
    return this.hostelService.listRooms(iid);
  }

  @Post('rooms')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOSTEL_WARDEN')
  @ApiOperation({ summary: 'Create hostel room' })
  createRoom(@Body() dto: CreateHostelRoomDto, @CurrentUser('institutionId') iid: string) {
    return this.hostelService.createRoom(dto, iid);
  }

  @Put('rooms/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOSTEL_WARDEN')
  @ApiOperation({ summary: 'Update hostel room' })
  updateRoom(@Param('id') id: string, @Body() dto: UpdateHostelRoomDto, @CurrentUser('institutionId') iid: string) {
    return this.hostelService.updateRoom(id, dto, iid);
  }

  @Delete('rooms/:id')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delete hostel room (soft delete)' })
  deleteRoom(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.hostelService.deleteRoom(id, iid);
  }

  @Get('allocations')
  @ApiOperation({ summary: 'List hostel allocations' })
  listAllocations(@CurrentUser('institutionId') iid: string, @Query('status') status?: string) {
    return this.hostelService.listAllocations(iid, status);
  }

  @Post('allocate')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOSTEL_WARDEN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Allocate room/bed to student' })
  allocate(@Body() dto: AllocateHostelDto, @CurrentUser('institutionId') iid: string) {
    return this.hostelService.allocate(dto, iid);
  }

  @Post('vacate')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOSTEL_WARDEN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Vacate hostel allocation' })
  vacate(@Body() dto: VacateHostelDto, @CurrentUser('institutionId') iid: string) {
    return this.hostelService.vacate(dto, iid);
  }
}

