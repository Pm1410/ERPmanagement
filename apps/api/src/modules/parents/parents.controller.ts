import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateParentDto, LinkStudentDto } from './dto/parents.dto';
import { ParentsService } from './parents.service';

@ApiTags('parents')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('parents')
export class ParentsController {
  constructor(private readonly parents: ParentsService) {}

  @Get('me')
  @Roles('PARENT')
  @ApiOperation({ summary: 'Get current parent profile + linked students' })
  me(@CurrentUser('id') userId: string, @CurrentUser('institutionId') iid: string) {
    return this.parents.me(userId, iid);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'List parents (admin)' })
  list(@CurrentUser('institutionId') iid: string) {
    return this.parents.list(iid);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create a parent ID (admin)' })
  create(@Body() dto: CreateParentDto, @CurrentUser('institutionId') iid: string) {
    return this.parents.create(dto, iid);
  }

  @Post(':id/link-student')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Link a student to a parent (admin)' })
  linkStudent(@Param('id') parentId: string, @Body() dto: LinkStudentDto, @CurrentUser('institutionId') iid: string) {
    return this.parents.linkStudent(parentId, dto, iid);
  }
}

