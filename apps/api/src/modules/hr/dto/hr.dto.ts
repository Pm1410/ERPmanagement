import {
  IsString, IsOptional, IsEnum, IsDateString, IsUUID,
  IsNumber, Min, IsInt, IsArray, ValidateNested, IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum LeaveType {
  CL = 'CL',   // Casual Leave
  EL = 'EL',   // Earned Leave
  ML = 'ML',   // Medical Leave
  LWP = 'LWP', // Leave Without Pay
  SPECIAL = 'SPECIAL',
}

export enum LeaveStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED' }

export class ApplyLeaveDto {
  @ApiProperty({ enum: LeaveType }) @IsEnum(LeaveType) leaveType: LeaveType;
  @ApiProperty() @IsDateString() fromDate: string;
  @ApiProperty() @IsDateString() toDate: string;
  @ApiProperty() @IsString() reason: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() substituteId?: string;
}

export class ApproveLeaveDto {
  @ApiProperty({ enum: LeaveStatus }) @IsEnum(LeaveStatus) status: LeaveStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class SalaryComponentDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() type: string; // EARNING, DEDUCTION
  @ApiProperty() @IsNumber() @Min(0) amount: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPercentage?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() percentage?: number;
}


export class SetPayrollConfigDto {
  @ApiProperty() @IsUUID() staffId: string;
  @ApiProperty() @IsNumber() @Min(0) basicSalary: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() hra?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() ta?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() da?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pf?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() esi?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() tds?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() professionalTax?: number;
  @ApiProperty({ type: [SalaryComponentDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => SalaryComponentDto)
  additionalComponents: SalaryComponentDto[];
}

export class RunPayrollDto {
  @ApiProperty() @IsInt() @Min(1) month: number;
  @ApiProperty() @IsInt() year: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) staffIds?: string[];
}
