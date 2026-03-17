import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateInstitutionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) website?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) logo?: string;
}

export class UpdateMyProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) avatar?: string;

  // Role-specific “extra” fields (optional, stored on faculty/student/parent rows)
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) address?: string;
}

export class TestEmailDto {
  @ApiProperty() @IsEmail() to: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) subject?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) message?: string;
}

export class TestSmsDto {
  @ApiProperty() @IsString() @MaxLength(30) to: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) message?: string;
}

