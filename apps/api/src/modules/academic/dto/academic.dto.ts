import { IsString, IsUUID, IsOptional, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAcademicYearDto {
  @ApiProperty() @IsString() name: string; // e.g. "2024-25"
  @ApiProperty() @IsString() startDate: string;
  @ApiProperty() @IsString() endDate: string;
}

export class CreateClassDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) orderIndex?: number;
  @ApiProperty() @IsUUID() academicYearId: string;
}

export class CreateSectionDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsUUID() classId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() classTeacherId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) maxStrength?: number;
}

export class CreateSubjectDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string; // THEORY, PRACTICAL, etc.
  @ApiProperty() @IsUUID() classId: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() weeklyPeriods?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() maxMarks?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() passMarks?: number;
}

export class TimetableSlotDto {
  @ApiProperty() @IsString() day: string; // MON, TUE, etc.
  @ApiProperty() @IsString() startTime: string; // "09:00"
  @ApiProperty() @IsString() endTime: string;   // "09:45"
  @ApiProperty() @IsUUID() subjectId: string;
  @ApiProperty() @IsUUID() facultyId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() room?: string;
}

export class SaveTimetableDto {
  @ApiProperty() @IsUUID() classId: string;
  @ApiProperty() @IsUUID() sectionId: string;
  @ApiProperty() @IsUUID() academicYearId: string;
  @ApiProperty({ type: [TimetableSlotDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => TimetableSlotDto)
  slots: TimetableSlotDto[];
}

export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) {}
export class UpdateClassDto extends PartialType(CreateClassDto) {}
export class UpdateSectionDto extends PartialType(CreateSectionDto) {}
export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
