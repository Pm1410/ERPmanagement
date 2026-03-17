import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';

const mockUser = {
  id: 'user-uuid-1',
  email: 'admin@school.edu.in',
  password: '', // filled in beforeEach
  name: 'Admin',
  isActive: true,
  institutionId: 'inst-1',
  avatar: null,
  lastLoginAt: null,
  role: { name: 'INSTITUTION_ADMIN', id: 'role-1' },
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockRedis = {
  setRefreshToken: jest.fn().mockResolvedValue(undefined),
  getRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn().mockResolvedValue(undefined),
  setOtp: jest.fn().mockResolvedValue(undefined),
  getOtp: jest.fn(),
  deleteOtp: jest.fn().mockResolvedValue(undefined),
};

const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('signed-token'),
  verify: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string, fallback?: unknown) => {
    const map: Record<string, unknown> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
    return map[key] ?? fallback;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    mockUser.password = await bcrypt.hash('Admin@1234', 10);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwt.signAsync.mockResolvedValue('signed-token');
  });

  describe('login', () => {
    it('returns tokens and user profile on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockRedis.setRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({ email: 'admin@school.edu.in', password: 'Admin@1234' });

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
      expect(result.user.email).toBe('admin@school.edu.in');
      expect(result.user.role).toBe('INSTITUTION_ADMIN');
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      await expect(
        service.login({ email: 'admin@school.edu.in', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@school.edu.in', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for inactive account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });
      await expect(
        service.login({ email: 'admin@school.edu.in', password: 'Admin@1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('issues new tokens for valid refresh token', async () => {
      mockJwt.verify.mockReturnValue({
        sub: 'user-uuid-1',
        email: 'admin@school.edu.in',
        role: 'INSTITUTION_ADMIN',
        institutionId: 'inst-1',
      });
      mockRedis.getRefreshToken.mockResolvedValue('valid-refresh-token');
      mockRedis.setRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
    });

    it('throws UnauthorizedException for revoked refresh token', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-uuid-1' });
      mockRedis.getRefreshToken.mockResolvedValue('different-token'); // mismatch

      await expect(service.refresh('valid-refresh-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for invalid JWT', async () => {
      mockJwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });
      await expect(service.refresh('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('deletes refresh token from Redis', async () => {
      await service.logout('user-uuid-1');
      expect(mockRedis.deleteRefreshToken).toHaveBeenCalledWith('user-uuid-1');
    });
  });

  describe('forgotPassword', () => {
    it('sets OTP in Redis and returns success message regardless of user existence', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.forgotPassword({ email: 'admin@school.edu.in' });
      expect(mockRedis.setOtp).toHaveBeenCalled();
      expect(result.message).toContain('OTP');
    });

    it('returns same message even if user does not exist (prevents enumeration)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.forgotPassword({ email: 'ghost@school.edu.in' });
      expect(mockRedis.setOtp).not.toHaveBeenCalled();
      expect(result.message).toContain('OTP');
    });
  });

  describe('resetPassword', () => {
    it('updates password when OTP is valid', async () => {
      mockRedis.getOtp.mockResolvedValue('123456');
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.resetPassword({
        email: 'admin@school.edu.in',
        otp: '123456',
        newPassword: 'NewPass@1234',
      });

      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(mockRedis.deleteOtp).toHaveBeenCalled();
      expect(result.message).toContain('reset');
    });

    it('throws BadRequestException for invalid OTP', async () => {
      mockRedis.getOtp.mockResolvedValue('999999');
      await expect(
        service.resetPassword({ email: 'admin@school.edu.in', otp: '123456', newPassword: 'NewPass@1234' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when OTP has expired (null from Redis)', async () => {
      mockRedis.getOtp.mockResolvedValue(null);
      await expect(
        service.resetPassword({ email: 'admin@school.edu.in', otp: '123456', newPassword: 'NewPass@1234' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
