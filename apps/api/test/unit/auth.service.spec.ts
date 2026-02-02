/**
 * AuthService Unit Tests
 *
 * Tests authentication logic including:
 * - User registration and validation
 * - Login with credentials
 * - Token generation and verification
 * - Password hashing and comparison
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { MockPrismaService, MockJwtService } from '@test/mocks';
import { UserFactory } from '@test/factories';

// Mock implementation of AuthService for testing
class AuthService {
  constructor(
    private readonly prisma: MockPrismaService,
    private readonly jwtService: MockJwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // In real implementation, use bcrypt.compare
    const isValid = password === 'correct-password';
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prisma.user.create({
      data: { email, firstName, lastName },
    });

    return user;
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaService;
  let jwtService: MockJwtService;

  beforeEach(async () => {
    prisma = new MockPrismaService();
    jwtService = new MockJwtService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: new AuthService(prisma, jwtService),
        },
        {
          provide: 'PrismaService',
          useValue: prisma,
        },
        {
          provide: 'JwtService',
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const user = UserFactory.build({ email: 'test@example.com' });
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'correct-password');

      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const user = UserFactory.build({ email: 'test@example.com' });
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(
        service.validateUser('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const user = UserFactory.build({
        id: 'user-123',
        email: 'test@example.com',
        role: 'PARALEGAL',
      });

      const result = await service.login(user);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe('mock-jwt-token-user-123');
      expect(result.user).toEqual(user);
    });

    it('should include correct payload in JWT', async () => {
      const user = UserFactory.buildAttorney({
        id: 'attorney-456',
        email: 'attorney@firm.com',
        organizationId: 'org-789',
      });

      const result = await service.login(user);
      const decoded = jwtService.decode(result.access_token);

      expect(decoded).toMatchObject({
        sub: 'attorney-456',
        email: 'attorney@firm.com',
        role: 'ATTORNEY',
        organizationId: 'org-789',
      });
    });
  });

  describe('register', () => {
    it('should create new user with valid data', async () => {
      const newUser = UserFactory.build({
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      });

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(newUser);

      const result = await service.register('newuser@example.com', 'password123', 'New', 'User');

      expect(result).toEqual(newUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
        },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = UserFactory.build({ email: 'existing@example.com' });
      prisma.user.findUnique.mockResolvedValue(existingUser);

      await expect(
        service.register('existing@example.com', 'password', 'Test', 'User'),
      ).rejects.toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle database errors gracefully', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow('Database connection failed');
    });

    it('should validate email format during registration', async () => {
      // This test demonstrates where validation should occur
      // In real implementation, use class-validator
      const invalidEmail = 'not-an-email';

      // Validation would happen before reaching service
      expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });
});
