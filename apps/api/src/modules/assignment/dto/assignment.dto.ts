import {
  IsString, IsUUID, IsOptional, IsInt, Min, IsDateString, IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instructions?: string;
  @ApiProperty() @IsUUID() classId: string;
  @ApiProperty() @IsUUID() sectionId: string;
  @ApiProperty() @IsUUID() subjectId: string;
  @ApiProperty() @IsDateString() dueDate: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) maxMarks?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() submissionType?: string; // FILE, TEXT, BOTH
}

export class GradeSubmissionDto {
  @ApiProperty() @IsNumber() @Min(0) marksObtained: number;
  @ApiPropertyOptional() @IsOptional() @IsString() feedback?: string;
}

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}
