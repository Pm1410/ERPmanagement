import {
  IsUUID, IsDateString, IsArray, ValidateNested, IsEnum, IsOptional, IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE',
  HOLIDAY = 'HOLIDAY',
}

export class AttendanceRecordDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty({ enum: AttendanceStatus }) @IsEnum(AttendanceStatus) status: AttendanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class MarkAttendanceDto {
  @ApiProperty() @IsUUID() classId: string;
  @ApiProperty() @IsUUID() sectionId: string;
  @ApiProperty() @IsUUID() subjectId: string;
  @ApiProperty() @IsUUID() academicYearId: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty({ type: [AttendanceRecordDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}

export class AttendanceQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() classId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() studentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() month?: string; // YYYY-MM
}

export class LeaveRequestDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsString() leaveType: string;
  @ApiProperty() @IsDateString() fromDate: string;
  @ApiProperty() @IsDateString() toDate: string;
  @ApiProperty() @IsString() reason: string;
}
