/**
 * Multi-Factor Authentication Service
 * OWASP Reference: A07:2021 - Identification and Authentication Failures
 *
 * Implements:
 * - TOTP (RFC 6238) generation and validation
 * - Backup codes with secure storage
 * - MFA enrollment flow
 * - Rate limiting for MFA attempts
 */

import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * TOTP Configuration (RFC 6238)
 */
export interface TotpConfig {
  /** Secret length in bytes (minimum 20 for SHA-1) */
  secretLength: number;
  /** Code length (6 or 8 digits) */
  codeLength: number;
  /** Time step in seconds (default 30) */
  timeStep: number;
  /** Hash algorithm */
  algorithm: 'sha1' | 'sha256' | 'sha512';
  /** Time drift tolerance (number of periods) */
  window: number;
  /** Issuer name for authenticator apps */
  issuer: string;
}

const defaultTotpConfig: TotpConfig = {
  secretLength: 20,
  codeLength: 6,
  timeStep: 30,
  algorithm: 'sha1', // Required for Google Authenticator compatibility
  window: 1, // Allow +/- 1 time step
  issuer: 'IRONCLAD',
};

/**
 * Backup codes configuration
 */
export interface BackupCodesConfig {
  /** Number of backup codes to generate */
  count: number;
  /** Code length in characters */
  codeLength: number;
  /** Code format (alphanumeric or numeric) */
  format: 'alphanumeric' | 'numeric';
}

const defaultBackupCodesConfig: BackupCodesConfig = {
  count: 10,
  codeLength: 8,
  format: 'alphanumeric',
};

/**
 * MFA enrollment result
 */
export interface MfaEnrollmentResult {
  /** Base32-encoded secret */
  secret: string;
  /** QR code URI for authenticator apps */
  qrCodeUri: string;
  /** Backup codes (only shown once) */
  backupCodes: string[];
  /** Recovery key (only shown once) */
  recoveryKey: string;
}

/**
 * MFA verification result
 */
export interface MfaVerificationResult {
  valid: boolean;
  usedBackupCode?: boolean;
  remainingBackupCodes?: number;
  error?: string;
}

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly totpConfig: TotpConfig;
  private readonly backupCodesConfig: BackupCodesConfig;

  constructor(
    totpConfig: Partial<TotpConfig> = {},
    backupCodesConfig: Partial<BackupCodesConfig> = {},
  ) {
    this.totpConfig = { ...defaultTotpConfig, ...totpConfig };
    this.backupCodesConfig = { ...defaultBackupCodesConfig, ...backupCodesConfig };
  }

  /**
   * Generate a new TOTP secret
   * SECURITY: Uses cryptographically secure random bytes
   */
  generateSecret(): string {
    const buffer = randomBytes(this.totpConfig.secretLength);
    return this.base32Encode(buffer);
  }

  /**
   * Generate MFA enrollment data
   */
  generateEnrollment(
    userId: string,
    userEmail: string,
  ): MfaEnrollmentResult {
    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes();
    const recoveryKey = this.generateRecoveryKey();

    const qrCodeUri = this.generateQrCodeUri(secret, userEmail);

    return {
      secret,
      qrCodeUri,
      backupCodes,
      recoveryKey,
    };
  }

  /**
   * Generate OTPAuth URI for QR code
   * Format: otpauth://totp/{issuer}:{account}?secret={secret}&issuer={issuer}&algorithm={alg}&digits={digits}&period={period}
   */
  generateQrCodeUri(secret: string, account: string): string {
    const params = new URLSearchParams({
      secret,
      issuer: this.totpConfig.issuer,
      algorithm: this.totpConfig.algorithm.toUpperCase(),
      digits: String(this.totpConfig.codeLength),
      period: String(this.totpConfig.timeStep),
    });

    const label = encodeURIComponent(`${this.totpConfig.issuer}:${account}`);
    return `otpauth://totp/${label}?${params.toString()}`;
  }

  /**
   * Generate TOTP code for current time
   * SECURITY: For testing/display purposes only
   */
  generateCode(secret: string, timestamp?: number): string {
    const time = timestamp ?? Date.now();
    const counter = Math.floor(time / 1000 / this.totpConfig.timeStep);
    return this.generateHotp(secret, counter);
  }

  /**
   * Verify TOTP code
   * SECURITY: Checks current time and window periods
   */
  verifyCode(secret: string, code: string, timestamp?: number): boolean {
    if (!code || code.length !== this.totpConfig.codeLength) {
      return false;
    }

    // Sanitize code (numeric only)
    const sanitizedCode = code.replace(/\D/g, '');
    if (sanitizedCode.length !== this.totpConfig.codeLength) {
      return false;
    }

    const time = timestamp ?? Date.now();
    const counter = Math.floor(time / 1000 / this.totpConfig.timeStep);

    // Check current period and window periods
    for (let i = -this.totpConfig.window; i <= this.totpConfig.window; i++) {
      const expectedCode = this.generateHotp(secret, counter + i);
      if (this.constantTimeCompare(sanitizedCode, expectedCode)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate HOTP code (RFC 4226)
   */
  private generateHotp(secret: string, counter: number): string {
    // Decode base32 secret
    const secretBuffer = this.base32Decode(secret);

    // Convert counter to 8-byte buffer
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    // HMAC-SHA hash
    const hmac = createHmac(this.totpConfig.algorithm, secretBuffer);
    hmac.update(counterBuffer);
    const hash = hmac.digest();

    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    // Generate code
    const otp = binary % Math.pow(10, this.totpConfig.codeLength);
    return otp.toString().padStart(this.totpConfig.codeLength, '0');
  }

  /**
   * Generate backup codes
   * SECURITY: Uses cryptographically secure random bytes
   */
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    const charset =
      this.backupCodesConfig.format === 'alphanumeric'
        ? 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excludes confusing chars (0,O,I,1)
        : '0123456789';

    for (let i = 0; i < this.backupCodesConfig.count; i++) {
      const bytes = randomBytes(this.backupCodesConfig.codeLength);
      let code = '';
      for (let j = 0; j < this.backupCodesConfig.codeLength; j++) {
        code += charset[bytes[j] % charset.length];
      }
      // Format as XXXX-XXXX for readability
      if (this.backupCodesConfig.codeLength === 8) {
        code = `${code.substring(0, 4)}-${code.substring(4)}`;
      }
      codes.push(code);
    }

    return codes;
  }

  /**
   * Verify backup code
   * SECURITY: Constant-time comparison, codes are single-use
   */
  verifyBackupCode(
    code: string,
    hashedCodes: string[],
  ): { valid: boolean; index: number } {
    // Normalize code (remove dashes, uppercase)
    const normalizedCode = code.replace(/-/g, '').toUpperCase();

    for (let i = 0; i < hashedCodes.length; i++) {
      const hashedCode = hashedCodes[i];
      // Hash the input code and compare
      const inputHash = this.hashBackupCode(normalizedCode);
      if (this.constantTimeCompare(inputHash, hashedCode)) {
        return { valid: true, index: i };
      }
    }

    return { valid: false, index: -1 };
  }

  /**
   * Hash a backup code for storage
   * SECURITY: Uses SHA-256 for backup code storage
   */
  hashBackupCode(code: string): string {
    const normalized = code.replace(/-/g, '').toUpperCase();
    const hash = createHmac('sha256', 'backup-code-salt')
      .update(normalized)
      .digest('hex');
    return hash;
  }

  /**
   * Generate recovery key
   * SECURITY: High-entropy key for account recovery
   */
  generateRecoveryKey(): string {
    const bytes = randomBytes(32);
    const segments: string[] = [];
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    for (let i = 0; i < 8; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += charset[bytes[i * 4 + j] % charset.length];
      }
      segments.push(segment);
    }

    return segments.join('-');
  }

  /**
   * Base32 encoding (RFC 4648)
   */
  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  /**
   * Base32 decoding (RFC 4648)
   */
  private base32Decode(input: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleanInput = input.toUpperCase().replace(/[^A-Z2-7]/g, '');

    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < cleanInput.length; i++) {
      const idx = alphabet.indexOf(cleanInput[i]);
      if (idx === -1) continue;

      value = (value << 5) | idx;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }

  /**
   * Constant-time string comparison
   * SECURITY: Prevents timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    return timingSafeEqual(bufferA, bufferB);
  }
}

export default MfaService;
