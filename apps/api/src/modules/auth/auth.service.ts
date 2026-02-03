import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionService } from './session.service';
import { MfaService } from './mfa/mfa.service';
import { JwtPayload } from '@common/interfaces';
import { RegisterDto, TokenResponseDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly mfaService: MfaService,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<JwtPayload | null> {
    try {
      // Query user with roles - this will use actual Prisma model when schema is ready
      const users = await this.prisma.$queryRaw<
        Array<{
          id: string;
          email: string;
          password_hash: string;
          organization_id: string;
          roles: string[];
          permissions: string[];
          is_active: boolean;
        }>
      >`
        SELECT u.id, u.email, u.password_hash, u.organization_id,
               COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
               COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') as permissions,
               u.is_active
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE u.email = ${email} AND u.deleted_at IS NULL
        GROUP BY u.id
        LIMIT 1
      `;

      const user = users[0];
      if (!user || !user.is_active) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return null;
      }

      return {
        sub: user.id,
        email: user.email,
        organizationId: user.organization_id,
        roles: user.roles,
        permissions: user.permissions,
        sessionId: '', // Will be set during login
      };
    } catch (error) {
      this.logger.error(
        `Failed to validate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Generate tokens and create session.
   * If user has MFA enabled, returns an mfaToken instead of full access.
   */
  async login(user: JwtPayload): Promise<TokenResponseDto> {
    // Check if user has MFA enabled
    const mfaEnabled = await this.mfaService.isMfaEnabled(user.sub);

    if (mfaEnabled) {
      // Return a short-lived MFA challenge token instead of full access
      const mfaToken = this.jwtService.sign(
        { sub: user.sub, type: 'mfa_challenge' },
        { expiresIn: '5m' },
      );

      return {
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        tokenType: 'Bearer',
        mfaRequired: true,
        mfaToken,
      };
    }

    return this.issueTokens(user);
  }

  /**
   * Verify MFA code and issue full tokens
   */
  async verifyMfaLogin(
    mfaToken: string,
    code: string,
    type: 'totp' | 'backup',
  ): Promise<TokenResponseDto> {
    // Validate the MFA challenge token
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(mfaToken);
    } catch {
      throw new UnauthorizedException('MFA challenge expired or invalid');
    }

    if (payload.type !== 'mfa_challenge') {
      throw new UnauthorizedException('Invalid MFA token');
    }

    // Verify the code
    let isValid: boolean;
    if (type === 'backup') {
      isValid = await this.mfaService.verifyBackupCode(payload.sub, code);
    } else {
      isValid = await this.mfaService.verifyCode(payload.sub, code);
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Fetch full user data and issue tokens
    const users = await this.prisma.$queryRaw<
      Array<{
        id: string;
        email: string;
        organization_id: string;
        roles: string[];
        permissions: string[];
      }>
    >`
      SELECT u.id, u.email, u.organization_id,
             COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
             COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') as permissions
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ${payload.sub}::uuid AND u.deleted_at IS NULL AND u.is_active = true
      GROUP BY u.id
      LIMIT 1
    `;

    if (users.length === 0 || !users[0]) {
      throw new UnauthorizedException('User not found');
    }

    const user = users[0];
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organization_id,
      roles: user.roles,
      permissions: user.permissions,
      sessionId: '',
    };

    return this.issueTokens(jwtPayload);
  }

  /**
   * Issue access + refresh tokens and create session
   */
  private async issueTokens(user: JwtPayload): Promise<TokenResponseDto> {
    const sessionId = uuidv4();
    const payload: JwtPayload = {
      ...user,
      sessionId,
    };

    // Create session
    await this.sessionService.createSession(user.sub, sessionId, {
      organizationId: user.organizationId,
      roles: user.roles,
    });

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.sub, sessionId, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpiresInSeconds(),
      tokenType: 'Bearer',
    };
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    // Check if email exists
    const existing = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM users WHERE email = ${dto.email} AND deleted_at IS NULL LIMIT 1
    `;

    if (existing.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const userId = uuidv4();
    // New registrations create a new org. Joining existing orgs requires admin invitation.
    const orgId = uuidv4();

    // Create user - in real implementation, this would use Prisma client
    await this.prisma.$executeRaw`
      INSERT INTO users (id, email, password_hash, first_name, last_name, organization_id, is_active, created_at, updated_at)
      VALUES (${userId}::uuid, ${dto.email}, ${passwordHash}, ${dto.firstName}, ${dto.lastName}, ${orgId}::uuid, true, NOW(), NOW())
    `;

    const payload: JwtPayload = {
      sub: userId,
      email: dto.email,
      organizationId: orgId,
      roles: ['staff'], // Default role
      permissions: [],
      sessionId: '',
    };

    return this.login(payload);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        sessionId: string;
        type: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Validate session still exists
      const session = await this.sessionService.getSession(payload.sessionId);
      if (!session) {
        throw new UnauthorizedException('Session expired');
      }

      // Get fresh user data
      const users = await this.prisma.$queryRaw<
        Array<{
          id: string;
          email: string;
          organization_id: string;
          roles: string[];
          permissions: string[];
        }>
      >`
        SELECT u.id, u.email, u.organization_id,
               COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
               COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') as permissions
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ${payload.sub}::uuid AND u.deleted_at IS NULL AND u.is_active = true
        GROUP BY u.id
        LIMIT 1
      `;

      if (users.length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = users[0];
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        organizationId: user.organization_id,
        roles: user.roles,
        permissions: user.permissions,
        sessionId: payload.sessionId,
      };

      // Update session activity
      await this.sessionService.touchSession(payload.sessionId);

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, sessionId: payload.sessionId, type: 'refresh' },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
        },
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getExpiresInSeconds(),
        tokenType: 'Bearer',
      };
    } catch (error) {
      this.logger.error(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout and invalidate session
   */
  async logout(sessionId: string): Promise<void> {
    await this.sessionService.deleteSession(sessionId);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const users = await this.prisma.$queryRaw<
      Array<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        organization_id: string;
        created_at: Date;
      }>
    >`
      SELECT id, email, first_name, last_name, organization_id, created_at
      FROM users
      WHERE id = ${userId}::uuid AND deleted_at IS NULL
      LIMIT 1
    `;

    if (users.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    return users[0];
  }

  /**
   * Get user's active sessions
   */
  async getUserSessions(userId: string) {
    return this.sessionService.getUserSessions(userId);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<number> {
    return this.sessionService.revokeAllExcept(userId, currentSessionId);
  }

  private getExpiresInSeconds(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match || !match[1] || !match[2]) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 60);
  }
}
