import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let sessionService: SessionService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret-key-at-least-32-chars',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_SECRET: 'test-refresh-secret-key-32-chars',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key];
    }),
  };

  const mockSessionService = {
    createSession: jest.fn(),
    getSession: jest.fn(),
    deleteSession: jest.fn(),
    touchSession: jest.fn(),
    isValidSession: jest.fn(),
    getUserSessions: jest.fn(),
    revokeAllExcept: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    sessionService = module.get<SessionService>(SessionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      organization_id: 'org-123',
      roles: ['staff'],
      permissions: ['matter:read'],
      is_active: true,
    };

    it('should return user payload when credentials are valid', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        sub: mockUser.id,
        email: mockUser.email,
        organizationId: mockUser.organization_id,
        roles: mockUser.roles,
        permissions: mockUser.permissions,
        sessionId: '',
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      const result = await service.validateUser('notfound@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ ...mockUser, is_active: false }]);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const mockPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      organizationId: 'org-123',
      roles: ['staff'],
      permissions: ['matter:read'],
      sessionId: '',
    };

    it('should return tokens and create session', async () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockSessionService.createSession.mockResolvedValue(undefined);

      const result = await service.login(mockPayload);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer',
      });
      expect(sessionService.createSession).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should throw ConflictException when email exists', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ id: 'existing-user' }]);

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('logout', () => {
    it('should delete session', async () => {
      mockSessionService.deleteSession.mockResolvedValue(undefined);

      await service.logout('session-123');

      expect(sessionService.deleteSession).toHaveBeenCalledWith('session-123');
    });
  });

  describe('revokeAllSessions', () => {
    it('should revoke all sessions except current', async () => {
      mockSessionService.revokeAllExcept.mockResolvedValue(3);

      const result = await service.revokeAllSessions('user-123', 'current-session');

      expect(result).toBe(3);
      expect(sessionService.revokeAllExcept).toHaveBeenCalledWith('user-123', 'current-session');
    });
  });
});
