import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  HOD = 'HOD',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  ACCOUNTANT = 'ACCOUNTANT',
  LIBRARIAN = 'LIBRARIAN',
  HOSTEL_WARDEN = 'HOSTEL_WARDEN',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',
  HR_MANAGER = 'HR_MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
}

export class LoginDto {
  @ApiProperty({ example: 'admin@school.edu.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@1234' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: RoleType })
  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@school.edu.in' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@school.edu.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'NewPass@1234' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
