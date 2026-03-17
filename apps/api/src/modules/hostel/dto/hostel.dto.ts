import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateHostelRoomDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hostelName?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() floor?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() roomType?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) capacity?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateHostelRoomDto extends PartialType(CreateHostelRoomDto) {}

export class AllocateHostelDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsUUID() roomId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bedNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class VacateHostelDto {
  @ApiProperty() @IsUUID() allocationId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

