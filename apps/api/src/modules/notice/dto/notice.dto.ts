import {
  IsString, IsOptional, IsEnum, IsArray, IsUUID, IsDateString, IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NoticePriority { NORMAL = 'NORMAL', URGENT = 'URGENT', EMERGENCY = 'EMERGENCY' }
export enum NoticeCategory { ACADEMIC = 'ACADEMIC', EVENT = 'EVENT', FEE = 'FEE', GENERAL = 'GENERAL', EMERGENCY = 'EMERGENCY' }
export enum NoticeTarget { ALL = 'ALL', CLASS = 'CLASS', SECTION = 'SECTION', INDIVIDUAL = 'INDIVIDUAL', PARENTS = 'PARENTS', FACULTY = 'FACULTY' }

export class CreateNoticeDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() body: string;
  @ApiPropertyOptional({ enum: NoticePriority }) @IsOptional() @IsEnum(NoticePriority) priority?: NoticePriority;
  @ApiPropertyOptional({ enum: NoticeCategory }) @IsOptional() @IsEnum(NoticeCategory) category?: NoticeCategory;
  @ApiProperty({ enum: NoticeTarget }) @IsEnum(NoticeTarget) target: NoticeTarget;
  @ApiPropertyOptional() @IsOptional() @IsUUID() classId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) recipientIds?: string[];
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() sendSms?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() sendEmail?: boolean;
}

export class SendMessageDto {
  @ApiProperty() @IsUUID() recipientId: string;
  @ApiProperty() @IsString() body: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() parentMessageId?: string;
}
