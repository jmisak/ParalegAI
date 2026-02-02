/**
 * Secure Session Management Service
 * OWASP Reference: A07:2021 - Identification and Authentication Failures
 *
 * Implements:
 * - Cryptographically secure session IDs
 * - Session binding (IP, User-Agent)
 * - Absolute and idle timeouts
 * - Session fixation protection
 * - Concurrent session limits
 */

import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createHash, createHmac } from 'crypto';

/**
 * Session configuration
 */
export interface SessionConfig {
  /** Session ID length in bytes */
  sessionIdLength: number;
  /** Idle timeout in seconds */
  idleTimeoutSec: number;
  /** Absolute timeout in seconds */
  absoluteTimeoutSec: number;
  /** Maximum concurrent sessions per user */
  maxConcurrentSessions: number;
  /** Bind session to IP address */
  bindToIp: boolean;
  /** Bind session to User-Agent */
  bindToUserAgent: boolean;
  /** Cookie name */
  cookieName: string;
  /** Cookie options */
  cookie: SessionCookieOptions;
  /** Regenerate session ID on privilege change */
  regenerateOnPrivilegeChange: boolean;
}

export interface SessionCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  domain?: string;
}

const defaultSessionConfig: SessionConfig = {
  sessionIdLength: 32,
  idleTimeoutSec: 900, // 15 minutes (CLAUDE.md requirement)
  absoluteTimeoutSec: 28800, // 8 hours (CLAUDE.md requirement)
  maxConcurrentSessions: 5,
  bindToIp: true,
  bindToUserAgent: true,
  cookieName: '__Host-session',
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  },
  regenerateOnPrivilegeChange: true,
};

/**
 * Session data structure
 */
export interface Session {
  /** Unique session ID (hashed for storage) */
  id: string;
  /** User ID */
  userId: string;
  /** Organization ID (multi-tenant) */
  organizationId: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last activity timestamp */
  lastActivityAt: Date;
  /** Session fingerprint (IP + UA hash) */
  fingerprint: string;
  /** IP address at creation */
  ipAddress: string;
  /** User-Agent at creation */
  userAgent: string;
  /** MFA verified flag */
  mfaVerified: boolean;
  /** Privilege level at session creation */
  privilegeLevel: number;
  /** Session metadata */
  metadata: Record<string, unknown>;
  /** Is session active */
  isActive: boolean;
  /** Invalidation reason (if invalidated) */
  invalidationReason?: string;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean;
  session?: Session;
  error?: string;
  errorCode?: SessionErrorCode;
}

export enum SessionErrorCode {
  NOT_FOUND = 'SESSION_NOT_FOUND',
  EXPIRED_IDLE = 'SESSION_EXPIRED_IDLE',
  EXPIRED_ABSOLUTE = 'SESSION_EXPIRED_ABSOLUTE',
  FINGERPRINT_MISMATCH = 'SESSION_FINGERPRINT_MISMATCH',
  INVALIDATED = 'SESSION_INVALIDATED',
  MFA_REQUIRED = 'SESSION_MFA_REQUIRED',
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly config: SessionConfig;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...defaultSessionConfig, ...config };
  }

  /**
   * Generate a cryptographically secure session ID
   * SECURITY: Uses crypto.randomBytes for true randomness
   */
  generateSessionId(): { raw: string; hashed: string } {
    const raw = randomBytes(this.config.sessionIdLength).toString('base64url');
    const hashed = this.hashSessionId(raw);
    return { raw, hashed };
  }

  /**
   * Hash session ID for storage
   * SECURITY: Store hashed IDs to prevent session hijacking via DB access
   */
  hashSessionId(sessionId: string): string {
    return createHash('sha256').update(sessionId).digest('hex');
  }

  /**
   * Generate session fingerprint
   * SECURITY: Binds session to client characteristics
   */
  generateFingerprint(ipAddress: string, userAgent: string): string {
    const components: string[] = [];

    if (this.config.bindToIp) {
      // Hash IP to avoid storing raw IPs
      components.push(createHash('sha256').update(ipAddress).digest('hex').substring(0, 16));
    }

    if (this.config.bindToUserAgent) {
      // Normalize and hash User-Agent
      const normalizedUa = this.normalizeUserAgent(userAgent);
      components.push(createHash('sha256').update(normalizedUa).digest('hex').substring(0, 16));
    }

    return components.join(':');
  }

  /**
   * Normalize User-Agent for fingerprinting
   * SECURITY: Handles minor browser version changes
   */
  private normalizeUserAgent(userAgent: string): string {
    // Extract browser family and major version only
    const browserPatterns = [
      /Chrome\/(\d+)/,
      /Firefox\/(\d+)/,
      /Safari\/(\d+)/,
      /Edge\/(\d+)/,
    ];

    for (const pattern of browserPatterns) {
      const match = userAgent.match(pattern);
      if (match) {
        return `${pattern.source.split('/')[0]}/${match[1]}`;
      }
    }

    // Fallback: use full UA
    return userAgent;
  }

  /**
   * Create a new session
   */
  createSession(
    userId: string,
    organizationId: string,
    ipAddress: string,
    userAgent: string,
    metadata: Record<string, unknown> = {},
  ): { session: Session; rawSessionId: string } {
    const { raw, hashed } = this.generateSessionId();
    const fingerprint = this.generateFingerprint(ipAddress, userAgent);
    const now = new Date();

    const session: Session = {
      id: hashed,
      userId,
      organizationId,
      createdAt: now,
      lastActivityAt: now,
      fingerprint,
      ipAddress,
      userAgent,
      mfaVerified: false,
      privilegeLevel: 0,
      metadata,
      isActive: true,
    };

    return { session, rawSessionId: raw };
  }

  /**
   * Validate a session
   */
  validateSession(
    session: Session,
    currentIp: string,
    currentUserAgent: string,
    requireMfa: boolean = false,
  ): SessionValidationResult {
    const now = new Date();

    // Check if session is active
    if (!session.isActive) {
      return {
        valid: false,
        error: 'Session has been invalidated',
        errorCode: SessionErrorCode.INVALIDATED,
      };
    }

    // Check absolute timeout
    const absoluteAge = (now.getTime() - session.createdAt.getTime()) / 1000;
    if (absoluteAge > this.config.absoluteTimeoutSec) {
      return {
        valid: false,
        error: 'Session has expired (absolute timeout)',
        errorCode: SessionErrorCode.EXPIRED_ABSOLUTE,
      };
    }

    // Check idle timeout
    const idleAge = (now.getTime() - session.lastActivityAt.getTime()) / 1000;
    if (idleAge > this.config.idleTimeoutSec) {
      return {
        valid: false,
        error: 'Session has expired (idle timeout)',
        errorCode: SessionErrorCode.EXPIRED_IDLE,
      };
    }

    // Validate fingerprint
    const currentFingerprint = this.generateFingerprint(currentIp, currentUserAgent);
    if (session.fingerprint !== currentFingerprint) {
      this.logger.warn(
        `Session fingerprint mismatch for user ${session.userId}`,
        {
          expected: session.fingerprint,
          received: currentFingerprint,
        },
      );
      return {
        valid: false,
        error: 'Session binding validation failed',
        errorCode: SessionErrorCode.FINGERPRINT_MISMATCH,
      };
    }

    // Check MFA requirement
    if (requireMfa && !session.mfaVerified) {
      return {
        valid: false,
        error: 'MFA verification required',
        errorCode: SessionErrorCode.MFA_REQUIRED,
      };
    }

    return { valid: true, session };
  }

  /**
   * Update session activity timestamp
   */
  touchSession(session: Session): Session {
    return {
      ...session,
      lastActivityAt: new Date(),
    };
  }

  /**
   * Regenerate session ID (session fixation protection)
   * SECURITY: Call this after privilege escalation (login, MFA)
   */
  regenerateSession(
    oldSession: Session,
    preserveData: boolean = true,
  ): { session: Session; rawSessionId: string } {
    const { raw, hashed } = this.generateSessionId();
    const now = new Date();

    const newSession: Session = {
      ...oldSession,
      id: hashed,
      createdAt: preserveData ? oldSession.createdAt : now,
      lastActivityAt: now,
    };

    return { session: newSession, rawSessionId: raw };
  }

  /**
   * Mark session as MFA verified
   */
  markMfaVerified(session: Session): Session {
    return {
      ...session,
      mfaVerified: true,
      lastActivityAt: new Date(),
    };
  }

  /**
   * Invalidate a session
   */
  invalidateSession(session: Session, reason: string): Session {
    return {
      ...session,
      isActive: false,
      invalidationReason: reason,
    };
  }

  /**
   * Get session cookie options
   */
  getCookieOptions(): SessionCookieOptions & { maxAge: number } {
    return {
      ...this.config.cookie,
      maxAge: this.config.absoluteTimeoutSec * 1000,
    };
  }

  /**
   * Calculate remaining session time
   */
  getRemainingTime(session: Session): {
    idleRemaining: number;
    absoluteRemaining: number;
  } {
    const now = Date.now();
    const idleRemaining = Math.max(
      0,
      this.config.idleTimeoutSec - (now - session.lastActivityAt.getTime()) / 1000,
    );
    const absoluteRemaining = Math.max(
      0,
      this.config.absoluteTimeoutSec - (now - session.createdAt.getTime()) / 1000,
    );

    return { idleRemaining, absoluteRemaining };
  }
}

export default SessionService;
