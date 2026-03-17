import {
  IsString, IsUUID, IsOptional, IsInt, Min, Max,
  IsArray, ValidateNested, IsDateString, IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExamDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() examType: string; // UNIT_TEST, MID_TERM, FINAL, PRACTICAL
  @ApiProperty() @IsUUID() academicYearId: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class CreateExamScheduleDto {
  @ApiProperty() @IsUUID() examId: string;
  @ApiProperty() @IsUUID() classId: string;
  @ApiProperty() @IsUUID() sectionId: string;
  @ApiProperty() @IsUUID() subjectId: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty() @IsString() startTime: string;
  @ApiProperty() @IsString() endTime: string;
  @ApiPropertyOptional() @IsOptional() @IsString() venue?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() invigilatorId?: string;
  @ApiProperty() @IsInt() @Min(0) maxMarks: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) passMarks?: number;
}

export class MarksEntryItemDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsNumber() @Min(0) marksObtained: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() grade?: string;
}

export class BulkMarksEntryDto {
  @ApiProperty() @IsUUID() examScheduleId: string;
  @ApiProperty({ type: [MarksEntryItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => MarksEntryItemDto)
  entries: MarksEntryItemDto[];
}

export class GradeConfigDto {
  @ApiProperty() @IsString() grade: string;  // A+, A, B+, etc.
  @ApiProperty() @IsInt() minMarks: number;
  @ApiProperty() @IsInt() maxMarks: number;
  @ApiProperty() @IsNumber() gradePoints: number;
}

export class UpdateExamDto extends PartialType(CreateExamDto) {}
