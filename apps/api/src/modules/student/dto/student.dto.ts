import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateStudentDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
  @ApiProperty() @IsDateString() dateOfBirth: string;
  @ApiProperty({ enum: Gender }) @IsEnum(Gender) gender: Gender;
  @ApiPropertyOptional() @IsString() @IsOptional() bloodGroup?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() religion?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() category?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() nationality?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() address?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() permanentAddress?: string;

  // Family
  @ApiPropertyOptional() @IsString() @IsOptional() fatherName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() fatherPhone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() fatherOccupation?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() motherName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() motherPhone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() guardianName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() guardianPhone?: string;
  @ApiPropertyOptional() @IsEmail() @IsOptional() parentEmail?: string;

  // Enrollment
  @ApiProperty() @IsUUID() classId: string;
  @ApiProperty() @IsUUID() sectionId: string;
  @ApiProperty() @IsUUID() academicYearId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() rollNumber?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() admissionNumber?: string;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

export class StudentQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() classId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() academicYearId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}
