import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty() @IsString() @MaxLength(120) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) description?: string;

  @ApiProperty() @IsUUID() classId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() subjectId?: string;
}

export class MaterialQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() classId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sectionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() subjectId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() uploadedById?: string;
}

