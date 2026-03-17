import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SettingsService } from './settings.service';
import { TestEmailDto, TestSmsDto, UpdateInstitutionDto, UpdateMyProfileDto } from './dto/settings.dto';

@ApiTags('settings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  // ── Me (all portals) ────────────────────────────────────────
  @Get('me')
  @ApiOperation({ summary: 'Get my profile settings' })
  me(@CurrentUser() user: any) {
    return this.settings.getMyProfile(user);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update my profile settings' })
  updateMe(@CurrentUser() user: any, @Body() dto: UpdateMyProfileDto) {
    return this.settings.updateMyProfile(user, dto);
  }

  // ── Management settings ─────────────────────────────────────
  @Get('institution')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Get institution settings (admin)' })
  institution(@CurrentUser('institutionId') iid: string) {
    return this.settings.getInstitutionSettings(iid);
  }

  @Put('institution')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Update institution settings (admin)' })
  updateInstitution(@CurrentUser('institutionId') iid: string, @Body() dto: UpdateInstitutionDto) {
    return this.settings.updateInstitutionSettings(iid, dto);
  }

  @Get('security')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Get security settings (read-only) (admin)' })
  security() {
    return this.settings.getSecuritySettings();
  }

  @Get('notifications/status')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Notification provider + queue + delivery status (admin)' })
  notificationStatus(@CurrentUser('institutionId') iid: string) {
    return this.settings.getNotificationStatus(iid);
  }

  @Post('notifications/test-email')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Queue a test email (admin)' })
  testEmail(@Body() dto: TestEmailDto, @CurrentUser('institutionId') iid: string) {
    return this.settings.testEmail(dto, iid);
  }

  @Post('notifications/test-sms')
  @Roles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Queue a test SMS (admin)' })
  testSms(@Body() dto: TestSmsDto, @CurrentUser('institutionId') iid: string) {
    return this.settings.testSms(dto, iid);
  }
}

