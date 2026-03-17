import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateParentDto {
  @ApiProperty() @IsString() @MaxLength(120) name: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() studentIds?: string[];
}

export class LinkStudentDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relation?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}

