import {
  IsString, IsOptional, IsInt, Min, IsISBN, IsUUID, IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() author: string;
  @ApiPropertyOptional() @IsOptional() @IsString() isbn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() publisher?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() edition?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) publishYear?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsInt() @Min(1) @Type(() => Number) totalCopies: number;
}

export class IssueBookDto {
  @ApiProperty() @IsUUID() bookId: string;
  @ApiProperty() @IsUUID() studentId: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
}

export class ReturnBookDto {
  @ApiProperty() @IsUUID() issueId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() condition?: string;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

export class BookQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() availability?: string; // AVAILABLE, ISSUED
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
}
