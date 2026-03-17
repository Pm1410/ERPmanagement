import {
  Controller, Get, Post, Patch, Body, Query, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  SendNotificationDto, BulkNotificationDto,
  TestNotificationDto, NotificationLogQueryDto,
} from './dto/notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'FACULTY', 'HOD')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a notification to a single recipient via one or more channels' })
  send(@Body() dto: SendNotificationDto) {
    return this.notificationService.send(dto);
  }

  @Post('bulk')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk send — resolve recipients from class/section/role then enqueue' })
  sendBulk(@Body() dto: BulkNotificationDto, @CurrentUser('institutionId') iid: string) {
    return this.notificationService.sendBulk(dto, iid);
  }

  @Post('test')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test notification to verify channel configuration' })
  test(@Body() dto: TestNotificationDto, @CurrentUser('institutionId') iid: string) {
    return this.notificationService.send({
      channels: [dto.channel],
      template: dto.template,
      recipient: dto.testRecipient,
      variables: {
        institutionName: 'Demo School',
        studentName: 'Test Student',
        parentName: 'Test Parent',
        name: 'Test User',
        otp: '123456',
        amount: '5000',
        date: new Date().toDateString(),
        year: new Date().getFullYear().toString(),
      },
      institutionId: iid,
    });
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delivery stats — sent, failed, pending, by channel' })
  getStats(@CurrentUser('institutionId') iid: string) {
    return this.notificationService.getDeliveryStats(iid);
  }

  @Get('logs')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Notification delivery logs with filters' })
  getLogs(@CurrentUser('institutionId') iid: string, @Query() query: NotificationLogQueryDto) {
    return this.notificationService.getLogs(iid, query);
  }

  @Get('queue-stats')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN')
  @ApiOperation({ summary: 'BullMQ queue stats — waiting, active, completed, failed' })
  getQueueStats() {
    return this.notificationService.getQueueStats();
  }

  @Get('in-app')
  @ApiOperation({ summary: 'Get in-app notifications for current user' })
  getInApp(@CurrentUser('id') userId: string) {
    return this.notificationService.getInAppNotifications(userId);
  }

  @Patch('in-app/:id/read')
  @ApiOperation({ summary: 'Mark in-app notification as read' })
  markInAppRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationService.markInAppRead(id, userId);
  }

  @Patch('in-app/read-all')
  @ApiOperation({ summary: 'Mark all in-app notifications as read' })
  markAllInAppRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllInAppRead(userId);
  }
}
