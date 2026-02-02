/**
 * Authentication Module Exports
 * Central export point for all authentication services
 */

// Password Security
export {
  PasswordService,
  type Argon2Config,
  type PasswordPolicy,
  type PasswordValidationResult,
} from './password.service';

// Multi-Factor Authentication
export {
  MfaService,
  type TotpConfig,
  type BackupCodesConfig,
  type MfaEnrollmentResult,
  type MfaVerificationResult,
} from './mfa.service';

// Session Management
export {
  SessionService,
  SessionErrorCode,
  type SessionConfig,
  type SessionCookieOptions,
  type Session,
  type SessionValidationResult,
} from './session.service';

// JWT Strategy
export {
  JwtStrategy,
  type JwtConfig,
  type JwtPayload,
  type TokenPair,
  type RefreshTokenMetadata,
} from './jwt.strategy';
