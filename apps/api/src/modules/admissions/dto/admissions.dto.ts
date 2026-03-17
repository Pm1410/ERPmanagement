import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAdmissionEnquiryDto {
  @ApiProperty() @IsString() parentName: string;
  @ApiProperty() @IsString() parentPhone: string;
  @ApiProperty() @IsString() childName: string;
  @ApiProperty() @IsString() classInterested: string;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

export class UpdateAdmissionEnquiryDto extends PartialType(CreateAdmissionEnquiryDto) {}

export class CreateAdmissionApplicationDto {
  @ApiProperty() @IsString() applicationNo: string;
  @ApiProperty() @IsString() studentName: string;
  @ApiProperty() @IsString() dateOfBirth: string;
  @ApiProperty() @IsString() classApplied: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

export class UpdateAdmissionApplicationDto extends PartialType(CreateAdmissionApplicationDto) {}

