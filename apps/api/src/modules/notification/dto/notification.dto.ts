import {
  IsString, IsEmail, IsOptional, IsEnum, IsArray,
  IsUUID, IsBoolean, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationTemplate {
  ATTENDANCE_ABSENT      = 'ATTENDANCE_ABSENT',
  ATTENDANCE_LATE        = 'ATTENDANCE_LATE',
  FEE_DUE                = 'FEE_DUE',
  FEE_RECEIPT            = 'FEE_RECEIPT',
  FEE_OVERDUE            = 'FEE_OVERDUE',
  EXAM_REMINDER          = 'EXAM_REMINDER',
  RESULT_PUBLISHED       = 'RESULT_PUBLISHED',
  NEW_NOTICE             = 'NEW_NOTICE',
  LEAVE_APPROVED         = 'LEAVE_APPROVED',
  LEAVE_REJECTED         = 'LEAVE_REJECTED',
  PASSWORD_RESET_OTP     = 'PASSWORD_RESET_OTP',
  WELCOME_STUDENT        = 'WELCOME_STUDENT',
  WELCOME_STAFF          = 'WELCOME_STAFF',
  WELCOME_PARENT         = 'WELCOME_PARENT',
  CONTRACT_EXPIRY        = 'CONTRACT_EXPIRY',
  PAYSLIP_GENERATED      = 'PAYSLIP_GENERATED',
  GRIEVANCE_UPDATE       = 'GRIEVANCE_UPDATE',
  ASSIGNMENT_DUE         = 'ASSIGNMENT_DUE',
  REPORT_CARD_READY      = 'REPORT_CARD_READY',
  BULK_NOTICE            = 'BULK_NOTICE',
}

export class SendNotificationDto {
  @ApiProperty({ enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({ enum: NotificationTemplate })
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @ApiProperty({ description: 'Recipient user ID or email/phone' })
  @IsString()
  recipient: string;

  @ApiProperty({ description: 'Template variable substitutions' })
  @IsObject()
  variables: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institutionId?: string;
}

export class BulkNotificationDto {
  @ApiProperty({ enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({ enum: NotificationTemplate })
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @ApiPropertyOptional({ description: 'Send to entire class' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Send to section' })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiPropertyOptional({ description: 'Explicit list of user IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientIds?: string[];

  @ApiPropertyOptional({ description: 'Send to all students' })
  @IsOptional()
  @IsBoolean()
  allStudents?: boolean;

  @ApiPropertyOptional({ description: 'Send to all faculty' })
  @IsOptional()
  @IsBoolean()
  allFaculty?: boolean;

  @ApiPropertyOptional({ description: 'Send to all parents (via parentEmail)' })
  @IsOptional()
  @IsBoolean()
  allParents?: boolean;

  @ApiProperty()
  @IsObject()
  variables: Record<string, string>;
}

export class TestNotificationDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ enum: NotificationTemplate })
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @ApiProperty({ description: 'Email address or phone number to send test to' })
  @IsString()
  testRecipient: string;
}

export class NotificationLogQueryDto {
  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateTo?: string;
}
