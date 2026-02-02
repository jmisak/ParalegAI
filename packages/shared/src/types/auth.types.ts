/**
 * Authentication and authorization types
 * @module types/auth
 */

import type { UserRole, UserStatus, Permission, MatterAccessLevel } from '../enums';

/**
 * Base user information
 */
export interface User {
  /** Unique user identifier */
  readonly id: string;
  /** User's email address (unique) */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's display name */
  displayName: string;
  /** User's role in the system */
  role: UserRole;
  /** User's account status */
  status: UserStatus;
  /** Combined permission flags */
  permissions: number;
  /** Organization/firm ID */
  organizationId: string;
  /** Optional department */
  department?: string | undefined;
  /** Optional job title */
  title?: string | undefined;
  /** User's phone number */
  phone?: string | undefined;
  /** Profile image URL */
  avatarUrl?: string | undefined;
  /** User's timezone */
  timezone: string;
  /** User's locale/language preference */
  locale: string;
  /** Whether email is verified */
  emailVerified: boolean;
  /** Whether MFA is enabled */
  mfaEnabled: boolean;
  /** Last login timestamp */
  lastLoginAt?: Date | undefined;
  /** Account creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * User credentials for authentication
 */
export interface UserCredentials {
  /** User's email */
  email: string;
  /** User's password (hashed in storage) */
  password: string;
}

/**
 * Session information
 */
export interface Session {
  /** Unique session identifier */
  readonly id: string;
  /** Associated user ID */
  userId: string;
  /** Session token (hashed in storage) */
  token: string;
  /** Refresh token (hashed in storage) */
  refreshToken: string;
  /** IP address of client */
  ipAddress: string;
  /** User agent string */
  userAgent: string;
  /** Session creation timestamp */
  readonly createdAt: Date;
  /** Session expiration timestamp */
  expiresAt: Date;
  /** Last activity timestamp */
  lastActivityAt: Date;
  /** Whether session is active */
  isActive: boolean;
}

/**
 * JWT access token payload
 */
export interface JWTPayload {
  /** Subject (user ID) */
  sub: string;
  /** User's email */
  email: string;
  /** User's role */
  role: UserRole;
  /** Combined permission flags */
  permissions: number;
  /** Organization ID */
  organizationId: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** JWT ID */
  jti: string;
  /** Issuer */
  iss: string;
  /** Audience */
  aud: string;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload {
  /** Subject (user ID) */
  sub: string;
  /** Session ID */
  sessionId: string;
  /** Token family for rotation detection */
  family: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** JWT ID */
  jti: string;
}

/**
 * Authentication response after successful login
 */
export interface AuthResponse {
  /** Access token */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Access token expiration (seconds) */
  expiresIn: number;
  /** Token type */
  tokenType: 'Bearer';
  /** Authenticated user */
  user: User;
}

/**
 * MFA challenge response
 */
export interface MFAChallenge {
  /** Challenge ID */
  challengeId: string;
  /** MFA method type */
  method: 'totp' | 'sms' | 'email';
  /** Partial identifier (e.g., masked phone) */
  hint: string;
  /** Challenge expiration timestamp */
  expiresAt: Date;
}

/**
 * Matter-specific access permission
 */
export interface MatterAccess {
  /** User ID */
  userId: string;
  /** Matter ID */
  matterId: string;
  /** Access level */
  accessLevel: MatterAccessLevel;
  /** Granted by user ID */
  grantedBy: string;
  /** Grant timestamp */
  grantedAt: Date;
  /** Optional expiration */
  expiresAt?: Date | undefined;
}

/**
 * Role permission mapping
 */
export interface RolePermissions {
  /** Role */
  role: UserRole;
  /** Combined permission flags */
  permissions: number;
  /** Role description */
  description: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  /** Request ID */
  readonly id: string;
  /** User ID */
  userId: string;
  /** Reset token (hashed in storage) */
  token: string;
  /** Request creation timestamp */
  readonly createdAt: Date;
  /** Token expiration timestamp */
  expiresAt: Date;
  /** Whether token has been used */
  used: boolean;
}

/**
 * Audit log entry for auth events
 */
export interface AuthAuditLog {
  /** Log entry ID */
  readonly id: string;
  /** User ID (if applicable) */
  userId?: string | undefined;
  /** Event type */
  event: AuthEventType;
  /** IP address */
  ipAddress: string;
  /** User agent */
  userAgent: string;
  /** Success status */
  success: boolean;
  /** Failure reason (if applicable) */
  failureReason?: string | undefined;
  /** Additional metadata */
  metadata?: Record<string, unknown> | undefined;
  /** Event timestamp */
  readonly timestamp: Date;
}

/**
 * Authentication event types for audit logging
 */
export type AuthEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'TOKEN_REFRESH'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETE'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'MFA_CHALLENGE'
  | 'MFA_VERIFY'
  | 'SESSION_REVOKED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED';

/**
 * Helper type to check if user has permission
 */
export type HasPermission = (userPermissions: number, requiredPermission: Permission) => boolean;

/**
 * Helper type to combine permissions
 */
export type CombinePermissions = (...permissions: Permission[]) => number;
