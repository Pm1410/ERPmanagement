import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GrievanceCategory {
  ACADEMIC = 'ACADEMIC',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  FEE = 'FEE',
  HARASSMENT = 'HARASSMENT',
  TRANSPORT = 'TRANSPORT',
  HOSTEL = 'HOSTEL',
  OTHER = 'OTHER',
}

export enum GrievanceStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export class CreateGrievanceDto {
  @ApiProperty({ enum: GrievanceCategory }) @IsEnum(GrievanceCategory) category: GrievanceCategory;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAnonymous?: boolean;
}

export class UpdateGrievanceDto {
  @ApiPropertyOptional({ enum: GrievanceStatus }) @IsOptional() @IsEnum(GrievanceStatus) status?: GrievanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedToId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() resolution?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}
