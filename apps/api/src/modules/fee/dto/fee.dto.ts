import {
  IsString, IsUUID, IsOptional, IsInt, Min, IsNumber,
  IsArray, ValidateNested, IsEnum, IsDateString, IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PaymentMode {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
  DD = 'DD',
  NEFT = 'NEFT',
}

export class FeeHeadDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isOptional?: boolean;
}

export class FeeStructureItemDto {
  @ApiProperty() @IsUUID() feeHeadId: string;
  @ApiProperty() @IsNumber() @Min(0) amount: number;
}

export class CreateFeeStructureDto {
  @ApiProperty() @IsUUID() classId: string;
  @ApiProperty() @IsUUID() academicYearId: string;
  @ApiProperty() @IsString() frequency: string; // MONTHLY, QUARTERLY, ANNUAL, ONE_TIME
  @ApiProperty({ type: [FeeStructureItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => FeeStructureItemDto)
  items: FeeStructureItemDto[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() lateFeePerDay?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
}

export class CollectFeeDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsNumber() @Min(1) amount: number;
  @ApiProperty({ enum: PaymentMode }) @IsEnum(PaymentMode) paymentMode: PaymentMode;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) feeHeadIds: string[];
}

export class InitiateOnlinePaymentDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsNumber() @Min(1) amount: number;
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) feeHeadIds: string[];
}

export class ConcessionDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsString() reason: string;
  @ApiProperty() @IsString() concessionType: string; // PERCENTAGE, FLAT
  @ApiProperty() @IsNumber() @Min(0) value: number;
  @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) feeHeadIds: string[];
}

export class UpdateFeeStructureDto extends PartialType(CreateFeeStructureDto) {}
