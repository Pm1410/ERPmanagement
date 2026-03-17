import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @ApiProperty() @IsString() vehicleNo: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Type(() => Number) capacity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() driverName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() driverPhone?: string;
}

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}

export class CreateRouteDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() vehicleId?: string;
}

export class UpdateRouteDto extends PartialType(CreateRouteDto) {}

export class CreateStopDto {
  @ApiProperty() @IsUUID() routeId: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Type(() => Number) order?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() pickupTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dropTime?: string;
}

export class AssignStudentTransportDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsUUID() routeId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() stopId?: string;
}

export class UnassignStudentTransportDto {
  @ApiProperty() @IsUUID() assignmentId: string;
}

