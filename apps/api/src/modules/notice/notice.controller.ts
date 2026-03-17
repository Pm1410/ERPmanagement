import {
  Controller, Get, Post, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, SendMessageDto } from './dto/notice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notices')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create and publish a notice' })
  create(
    @Body() dto: CreateNoticeDto,
    @CurrentUser('id') authorId: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.noticeService.createNotice(dto, authorId, iid);
  }

  @Get()
  @ApiOperation({ summary: 'Get notices for user' })
  getNotices(
    @CurrentUser() user: any,
    @CurrentUser('institutionId') iid: string,
    @Query('classId') classId?: string,
  ) {
    return this.noticeService.getNotices({ userId: user.id, role: user.role, classId }, iid);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notice as read' })
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.noticeService.markRead(id, userId);
  }

  @Delete(':id')
  @Roles('FACULTY', 'HOD', 'PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a notice' })
  delete(@Param('id') id: string, @CurrentUser('institutionId') iid: string) {
    return this.noticeService.deleteNotice(id, iid);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a direct message' })
  sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser('id') senderId: string,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.noticeService.sendMessage(dto, senderId, iid);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get message inbox' })
  getMessages(@CurrentUser('id') userId: string, @Query('otherUserId') otherUserId?: string) {
    return this.noticeService.getMessages(userId, otherUserId);
  }

  @Get('messages/thread/:parentId')
  @ApiOperation({ summary: 'Get message thread' })
  getThread(@Param('parentId') parentId: string) {
    return this.noticeService.getThread(parentId);
  }

  @Post('bulk-notify')
  @Roles('PRINCIPAL', 'INSTITUTION_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Bulk notify via SMS/email' })
  bulkNotify(
    @Body() body: any,
    @CurrentUser('institutionId') iid: string,
  ) {
    return this.noticeService.bulkNotify(body, iid);
  }
}
