/**
 * Password Security Service
 * OWASP Reference: A07:2021 - Identification and Authentication Failures
 *
 * Implements:
 * - Argon2id password hashing (OWASP recommended)
 * - Password breach checking via k-Anonymity (Have I Been Pwned)
 * - Password strength validation
 * - Secure password comparison
 */

import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { createHash } from 'crypto';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

/**
 * Argon2id configuration (OWASP recommended parameters)
 * Reference: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
export interface Argon2Config {
  /** Memory cost in KiB (minimum 47104 KiB for OWASP compliance) */
  memoryCost: number;
  /** Time cost (iterations) */
  timeCost: number;
  /** Parallelism (threads) */
  parallelism: number;
  /** Hash length in bytes */
  hashLength: number;
  /** Algorithm variant */
  type: 0 | 1 | 2; // 0=d, 1=i, 2=id
}

const defaultArgon2Config: Argon2Config = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 threads
  hashLength: 32,    // 256 bits
  type: 2,           // Argon2id
};

/**
 * Password policy configuration
 */
export interface PasswordPolicy {
  /** Minimum length (NIST recommends 8, OWASP recommends 12) */
  minLength: number;
  /** Maximum length (prevent DoS, allow passphrases) */
  maxLength: number;
  /** Require uppercase letters */
  requireUppercase: boolean;
  /** Require lowercase letters */
  requireLowercase: boolean;
  /** Require numbers */
  requireNumbers: boolean;
  /** Require special characters */
  requireSpecial: boolean;
  /** Minimum character classes (1-4) */
  minCharacterClasses: number;
  /** Check against breach database */
  checkBreached: boolean;
  /** Minimum days between password changes */
  minAgeDays: number;
  /** Maximum days before password expires (0 = never) */
  maxAgeDays: number;
  /** Number of previous passwords to remember */
  historyCount: number;
}

const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: false,
  requireLowercase: false,
  requireNumbers: false,
  requireSpecial: false,
  minCharacterClasses: 3,
  checkBreached: true,
  minAgeDays: 1,
  maxAgeDays: 0, // No expiration (NIST recommendation)
  historyCount: 10,
};

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
  breached: boolean;
  breachCount?: number;
}

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly argon2Config: Argon2Config;
  private readonly passwordPolicy: PasswordPolicy;

  constructor(
    argon2Config: Partial<Argon2Config> = {},
    passwordPolicy: Partial<PasswordPolicy> = {},
  ) {
    this.argon2Config = { ...defaultArgon2Config, ...argon2Config };
    this.passwordPolicy = { ...defaultPasswordPolicy, ...passwordPolicy };
  }

  /**
   * Hash a password using Argon2id
   * SECURITY: Uses Argon2id which is resistant to GPU and side-channel attacks
   */
  async hash(password: string): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new Error('Invalid password input');
    }

    // Enforce maximum length to prevent DoS
    if (password.length > this.passwordPolicy.maxLength) {
      throw new Error('Password exceeds maximum length');
    }

    try {
      const hash = await argon2.hash(password, {
        type: this.argon2Config.type,
        memoryCost: this.argon2Config.memoryCost,
        timeCost: this.argon2Config.timeCost,
        parallelism: this.argon2Config.parallelism,
        hashLength: this.argon2Config.hashLength,
      });

      return hash;
    } catch (error) {
      this.logger.error('Password hashing failed', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify a password against a hash
   * SECURITY: Uses timing-safe comparison internally
   */
  async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      // Log error but don't expose details
      this.logger.warn('Password verification error');
      return false;
    }
  }

  /**
   * Check if hash needs rehashing (config changed)
   * SECURITY: Enables transparent algorithm upgrades
   */
  async needsRehash(hash: string): Promise<boolean> {
    try {
      return argon2.needsRehash(hash, {
        type: this.argon2Config.type,
        memoryCost: this.argon2Config.memoryCost,
        timeCost: this.argon2Config.timeCost,
        parallelism: this.argon2Config.parallelism,
      });
    } catch {
      return true; // Rehash on error
    }
  }

  /**
   * Validate password against policy
   */
  async validate(
    password: string,
    userContext?: { email?: string; username?: string; previousHashes?: string[] },
  ): Promise<PasswordValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    let breached = false;
    let breachCount: number | undefined;

    // Check length
    if (password.length < this.passwordPolicy.minLength) {
      errors.push(`Password must be at least ${this.passwordPolicy.minLength} characters`);
      score -= 30;
    }

    if (password.length > this.passwordPolicy.maxLength) {
      errors.push(`Password must not exceed ${this.passwordPolicy.maxLength} characters`);
      score -= 10;
    }

    // Check character classes
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const classCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;

    if (classCount < this.passwordPolicy.minCharacterClasses) {
      errors.push(
        `Password must contain at least ${this.passwordPolicy.minCharacterClasses} character types (uppercase, lowercase, numbers, special)`,
      );
      score -= 20;
    }

    // Specific requirements
    if (this.passwordPolicy.requireUppercase && !hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
      score -= 5;
    }

    if (this.passwordPolicy.requireLowercase && !hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
      score -= 5;
    }

    if (this.passwordPolicy.requireNumbers && !hasNumbers) {
      errors.push('Password must contain at least one number');
      score -= 5;
    }

    if (this.passwordPolicy.requireSpecial && !hasSpecial) {
      errors.push('Password must contain at least one special character');
      score -= 5;
    }

    // Check for common patterns
    if (/^[A-Za-z]+$/.test(password)) {
      warnings.push('Password contains only letters');
      score -= 10;
    }

    if (/^[0-9]+$/.test(password)) {
      errors.push('Password cannot be all numbers');
      score -= 30;
    }

    if (/(.)\1{2,}/.test(password)) {
      warnings.push('Password contains repeated characters');
      score -= 10;
    }

    if (/^(123|abc|qwerty|password)/i.test(password)) {
      errors.push('Password contains common patterns');
      score -= 30;
    }

    // Check against user context (email, username)
    if (userContext) {
      if (userContext.email) {
        const emailLocal = userContext.email.split('@')[0].toLowerCase();
        if (password.toLowerCase().includes(emailLocal)) {
          errors.push('Password cannot contain your email address');
          score -= 20;
        }
      }

      if (userContext.username) {
        if (password.toLowerCase().includes(userContext.username.toLowerCase())) {
          errors.push('Password cannot contain your username');
          score -= 20;
        }
      }

      // Check password history
      if (userContext.previousHashes && userContext.previousHashes.length > 0) {
        for (const previousHash of userContext.previousHashes.slice(0, this.passwordPolicy.historyCount)) {
          if (await this.verify(password, previousHash)) {
            errors.push('Password was used recently');
            score -= 50;
            break;
          }
        }
      }
    }

    // Check breach database
    if (this.passwordPolicy.checkBreached) {
      const breachResult = await this.checkBreached(password);
      breached = breachResult.breached;
      breachCount = breachResult.count;

      if (breached) {
        errors.push(`Password found in ${breachCount?.toLocaleString() || 'multiple'} data breaches`);
        score -= 50;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, Math.min(100, score)),
      breached,
      breachCount,
    };
  }

  /**
   * Check if password appears in breach databases
   * SECURITY: Uses k-Anonymity model (HIBP API) - only first 5 chars of hash sent
   */
  async checkBreached(password: string): Promise<{ breached: boolean; count?: number }> {
    try {
      // SHA-1 hash of password (HIBP uses SHA-1)
      const sha1Hash = createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      // Query HIBP API with k-Anonymity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${prefix}`,
        {
          headers: {
            'User-Agent': 'IRONCLAD-Security-Service',
            'Add-Padding': 'true', // Prevent response length attacks
          },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.warn(`HIBP API returned ${response.status}`);
        return { breached: false }; // Fail open on API error
      }

      const text = await response.text();
      const lines = text.split('\n');

      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix.trim().toUpperCase() === suffix) {
          return {
            breached: true,
            count: parseInt(count.trim(), 10),
          };
        }
      }

      return { breached: false };
    } catch (error) {
      this.logger.warn('Breach check failed', error);
      return { breached: false }; // Fail open on error
    }
  }

  /**
   * Generate a secure random password
   * SECURITY: Uses crypto.getRandomValues for true randomness
   */
  generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }

  /**
   * Constant-time string comparison
   * SECURITY: Prevents timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

export default PasswordService;
