import {
  IsOptional, IsString, IsEnum, IsUUID, IsInt, Min, Max,
  IsArray, IsIn, IsNumber,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ReportRange { WEEK = 'WEEK', MONTH = 'MONTH', YEAR = 'YEAR' }
export enum ReportEntity { STUDENTS = 'STUDENTS', FACULTY = 'FACULTY', FEES = 'FEES', ATTENDANCE = 'ATTENDANCE', EXAMS = 'EXAMS', LIBRARY = 'LIBRARY' }
export enum ReportFormat { JSON = 'JSON', CSV = 'CSV', EXCEL = 'EXCEL', PDF = 'PDF' }

export class AttendanceTrendsDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() classId?: string;
  @ApiPropertyOptional({ enum: ReportRange }) @IsOptional() @IsEnum(ReportRange) range?: ReportRange;
}

export class ExamPerformanceDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() classId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() examId?: string;
}

export class FeeCollectionDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(2000) @Max(2099) year?: number;
}

export class AtRiskDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() attendanceThreshold?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() marksThreshold?: number;
}

export class CustomReportDto {
  @ApiProperty({ enum: ReportEntity }) @IsEnum(ReportEntity) entity: ReportEntity;
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) fields: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() dateFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dateTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() classId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ enum: ReportFormat }) @IsOptional() @IsEnum(ReportFormat) format?: ReportFormat;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) limit?: number;
}

export class ScheduleReportDto extends CustomReportDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() cronExpression: string; // e.g. "0 8 * * 1" = every Monday 8am
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) emailRecipients: string[];
}

export class SubjectPerformanceDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() classId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() examId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
}

export class LibraryUtilizationDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12) month?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() year?: number;
}
