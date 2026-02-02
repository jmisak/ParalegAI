/**
 * JWT Strategy with Token Rotation
 * OWASP Reference: A07:2021 - Identification and Authentication Failures
 *
 * Implements:
 * - Short-lived access tokens (15 min)
 * - Long-lived refresh tokens (7 days) with rotation
 * - Token binding to session
 * - Secure token storage recommendations
 * - Token revocation support
 */

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * JWT configuration
 */
export interface JwtConfig {
  /** Access token expiration in seconds */
  accessTokenExpiresIn: number;
  /** Refresh token expiration in seconds */
  refreshTokenExpiresIn: number;
  /** Token issuer */
  issuer: string;
  /** Token audience */
  audience: string;
  /** Algorithm (HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512) */
  algorithm: string;
  /** Rotate refresh token on use */
  rotateRefreshToken: boolean;
  /** Grace period for old refresh tokens (seconds) */
  refreshTokenGracePeriod: number;
}

const defaultJwtConfig: JwtConfig = {
  accessTokenExpiresIn: 900, // 15 minutes
  refreshTokenExpiresIn: 604800, // 7 days
  issuer: 'ironclad',
  audience: 'ironclad-api',
  algorithm: 'HS512',
  rotateRefreshToken: true,
  refreshTokenGracePeriod: 30,
};

/**
 * JWT payload structure
 */
export interface JwtPayload {
  /** Subject (user ID) */
  sub: string;
  /** Organization ID */
  org: string;
  /** Session ID (hashed) */
  sid: string;
  /** Issued at (Unix timestamp) */
  iat: number;
  /** Expiration (Unix timestamp) */
  exp: number;
  /** Not before (Unix timestamp) */
  nbf: number;
  /** Issuer */
  iss: string;
  /** Audience */
  aud: string;
  /** JWT ID (unique identifier) */
  jti: string;
  /** Token type (access or refresh) */
  type: 'access' | 'refresh';
  /** MFA verified */
  mfa: boolean;
  /** User roles */
  roles: string[];
  /** Custom claims */
  claims?: Record<string, unknown>;
}

/**
 * Token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * Refresh token metadata for storage
 */
export interface RefreshTokenMetadata {
  /** Token ID (jti) */
  id: string;
  /** User ID */
  userId: string;
  /** Session ID */
  sessionId: string;
  /** Token hash (for storage) */
  tokenHash: string;
  /** Issued at */
  issuedAt: Date;
  /** Expires at */
  expiresAt: Date;
  /** Used at (for rotation tracking) */
  usedAt?: Date;
  /** Revoked at */
  revokedAt?: Date;
  /** Revocation reason */
  revocationReason?: string;
  /** IP address at issuance */
  ipAddress: string;
  /** User-Agent at issuance */
  userAgent: string;
  /** Family ID (for refresh token rotation) */
  familyId: string;
}

@Injectable()
export class JwtStrategy {
  private readonly logger = new Logger(JwtStrategy.name);
  private readonly config: JwtConfig;

  constructor(config: Partial<JwtConfig> = {}) {
    this.config = { ...defaultJwtConfig, ...config };
  }

  /**
   * Generate a token pair (access + refresh)
   */
  generateTokenPair(
    userId: string,
    organizationId: string,
    sessionId: string,
    roles: string[],
    mfaVerified: boolean,
    secret: string,
    claims?: Record<string, unknown>,
  ): TokenPair {
    const now = Math.floor(Date.now() / 1000);
    const jtiAccess = this.generateJti();
    const jtiRefresh = this.generateJti();

    const accessPayload: JwtPayload = {
      sub: userId,
      org: organizationId,
      sid: sessionId,
      iat: now,
      exp: now + this.config.accessTokenExpiresIn,
      nbf: now,
      iss: this.config.issuer,
      aud: this.config.audience,
      jti: jtiAccess,
      type: 'access',
      mfa: mfaVerified,
      roles,
      claims,
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      org: organizationId,
      sid: sessionId,
      iat: now,
      exp: now + this.config.refreshTokenExpiresIn,
      nbf: now,
      iss: this.config.issuer,
      aud: this.config.audience,
      jti: jtiRefresh,
      type: 'refresh',
      mfa: mfaVerified,
      roles,
    };

    const accessToken = this.sign(accessPayload, secret);
    const refreshToken = this.sign(refreshPayload, secret);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date((now + this.config.accessTokenExpiresIn) * 1000),
      refreshTokenExpiresAt: new Date((now + this.config.refreshTokenExpiresIn) * 1000),
    };
  }

  /**
   * Sign a JWT payload
   * SECURITY: Uses HMAC-SHA512 by default
   */
  sign(payload: JwtPayload, secret: string): string {
    const header = {
      alg: this.config.algorithm,
      typ: 'JWT',
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = this.createSignature(signatureInput, secret);

    return `${signatureInput}.${signature}`;
  }

  /**
   * Verify and decode a JWT
   */
  verify(token: string, secret: string): { valid: boolean; payload?: JwtPayload; error?: string } {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Invalid token format' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const [encodedHeader, encodedPayload, providedSignature] = parts;

    // Verify signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.createSignature(signatureInput, secret);

    if (!this.constantTimeCompare(providedSignature, expectedSignature)) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Decode payload
    let payload: JwtPayload;
    try {
      payload = JSON.parse(this.base64UrlDecode(encodedPayload));
    } catch {
      return { valid: false, error: 'Invalid payload encoding' };
    }

    // Validate claims
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }

    if (payload.nbf && payload.nbf > now) {
      return { valid: false, error: 'Token not yet valid' };
    }

    if (payload.iss !== this.config.issuer) {
      return { valid: false, error: 'Invalid issuer' };
    }

    if (payload.aud !== this.config.audience) {
      return { valid: false, error: 'Invalid audience' };
    }

    return { valid: true, payload };
  }

  /**
   * Refresh tokens with rotation
   */
  refreshTokens(
    refreshToken: string,
    secret: string,
  ): { tokenPair?: TokenPair; oldJti?: string; error?: string } {
    const result = this.verify(refreshToken, secret);

    if (!result.valid || !result.payload) {
      return { error: result.error || 'Invalid refresh token' };
    }

    if (result.payload.type !== 'refresh') {
      return { error: 'Invalid token type' };
    }

    // Generate new token pair
    const tokenPair = this.generateTokenPair(
      result.payload.sub,
      result.payload.org,
      result.payload.sid,
      result.payload.roles,
      result.payload.mfa,
      secret,
      result.payload.claims,
    );

    return {
      tokenPair,
      oldJti: result.payload.jti,
    };
  }

  /**
   * Generate unique JWT ID
   */
  private generateJti(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Create HMAC signature
   */
  private createSignature(input: string, secret: string): string {
    const algorithm = this.config.algorithm.toLowerCase().replace('hs', 'sha');
    const hmac = createHmac(algorithm, secret);
    hmac.update(input);
    return this.base64UrlEncode(hmac.digest());
  }

  /**
   * Base64URL encode
   */
  private base64UrlEncode(input: string | Buffer): string {
    const base64 = Buffer.from(input).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Base64URL decode
   */
  private base64UrlDecode(input: string): string {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  /**
   * Hash refresh token for storage
   */
  hashRefreshToken(token: string): string {
    return createHmac('sha256', 'refresh-token-storage')
      .update(token)
      .digest('hex');
  }

  /**
   * Constant-time string comparison
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    return timingSafeEqual(bufA, bufB);
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type.toLowerCase() !== 'bearer' || !token) {
      return null;
    }

    return token;
  }

  /**
   * Get configuration for client
   */
  getPublicConfig(): { accessTokenExpiresIn: number; refreshTokenExpiresIn: number } {
    return {
      accessTokenExpiresIn: this.config.accessTokenExpiresIn,
      refreshTokenExpiresIn: this.config.refreshTokenExpiresIn,
    };
  }
}

export default JwtStrategy;
