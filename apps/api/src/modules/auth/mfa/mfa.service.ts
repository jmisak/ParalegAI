import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * MFA enrollment result
 */
export interface MfaEnrollmentResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}

/**
 * MFA Service
 *
 * Provides multi-factor authentication using TOTP (RFC 6238)
 * with backup codes for account recovery.
 *
 * @security CRITICAL - This service handles sensitive authentication data
 */
@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly issuer: string;
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.issuer = this.configService.get<string>('MFA_ISSUER') || 'Ironclad';

    // Derive encryption key for secrets at rest
    const secret = this.configService.get<string>('MFA_ENCRYPTION_KEY') ||
      this.configService.get<string>('JWT_SECRET') || 'default-key';
    this.encryptionKey = crypto.scryptSync(secret, 'mfa-salt', 32);
  }

  /**
   * Enroll a user in MFA
   *
   * @param userId - User ID
   * @param email - User email for TOTP label
   * @returns Enrollment data including QR code and backup codes
   */
  async enrollMfa(userId: string, email: string): Promise<MfaEnrollmentResult> {
    // Check if already enrolled
    const existing = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM user_mfa WHERE user_id = ${userId}::uuid AND is_active = true LIMIT 1
    `;

    if (existing.length > 0) {
      throw new BadRequestException('MFA is already enabled for this account');
    }

    // Generate TOTP secret
    const secret = new OTPAuth.Secret({ size: 20 });
    const secretBase32 = secret.base32;

    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: this.issuer,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Generate QR code
    const otpauthUrl = totp.toString();
    const qrCode = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    // Encrypt secret for storage
    const encryptedSecret = this.encryptSecret(secretBase32);

    // Store pending MFA enrollment (not yet verified)
    await this.prisma.$executeRaw`
      INSERT INTO user_mfa (id, user_id, secret_encrypted, backup_codes_hash, is_active, is_verified, created_at, updated_at)
      VALUES (
        ${crypto.randomUUID()}::uuid,
        ${userId}::uuid,
        ${encryptedSecret},
        ${JSON.stringify(hashedBackupCodes)},
        false,
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) WHERE is_active = false
      DO UPDATE SET
        secret_encrypted = ${encryptedSecret},
        backup_codes_hash = ${JSON.stringify(hashedBackupCodes)},
        updated_at = NOW()
    `;

    this.logger.log(`MFA enrollment initiated for user ${userId}`);

    return {
      secret: secretBase32,
      qrCode,
      backupCodes,
      manualEntryKey: this.formatManualEntry(secretBase32),
    };
  }

  /**
   * Verify MFA enrollment with a TOTP code
   *
   * @param userId - User ID
   * @param code - TOTP code from authenticator app
   */
  async verifyEnrollment(userId: string, code: string): Promise<void> {
    const mfaRecords = await this.prisma.$queryRaw<
      Array<{
        id: string;
        secret_encrypted: string;
        is_verified: boolean;
      }>
    >`
      SELECT id, secret_encrypted, is_verified
      FROM user_mfa
      WHERE user_id = ${userId}::uuid AND is_active = false AND is_verified = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (mfaRecords.length === 0) {
      throw new BadRequestException('No pending MFA enrollment found');
    }

    const mfaRecord = mfaRecords[0];
    if (!mfaRecord) {
      throw new BadRequestException('No pending MFA enrollment found');
    }
    const secret = this.decryptSecret(mfaRecord.secret_encrypted);

    // Verify the code
    if (!this.verifyTotp(secret, code)) {
      throw new BadRequestException('Invalid verification code');
    }

    // Activate MFA
    await this.prisma.$executeRaw`
      UPDATE user_mfa
      SET is_active = true, is_verified = true, updated_at = NOW()
      WHERE id = ${mfaRecord.id}::uuid
    `;

    // Update user record
    await this.prisma.$executeRaw`
      UPDATE users
      SET mfa_enabled = true, updated_at = NOW()
      WHERE id = ${userId}::uuid
    `;

    this.logger.log(`MFA successfully enabled for user ${userId}`);
  }

  /**
   * Verify a TOTP code during login
   *
   * @param userId - User ID
   * @param code - TOTP code
   * @returns true if valid
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const mfaRecords = await this.prisma.$queryRaw<
      Array<{
        secret_encrypted: string;
        last_used_counter: number | null;
      }>
    >`
      SELECT secret_encrypted, last_used_counter
      FROM user_mfa
      WHERE user_id = ${userId}::uuid AND is_active = true
      LIMIT 1
    `;

    if (mfaRecords.length === 0) {
      throw new UnauthorizedException('MFA not configured');
    }

    const mfaRecord = mfaRecords[0];
    if (!mfaRecord) {
      throw new UnauthorizedException('MFA not configured');
    }
    const secret = this.decryptSecret(mfaRecord.secret_encrypted);

    // Check if code is valid
    const isValid = this.verifyTotp(secret, code);

    if (isValid) {
      // Update last used timestamp to prevent replay attacks
      await this.prisma.$executeRaw`
        UPDATE user_mfa
        SET last_used_at = NOW(), updated_at = NOW()
        WHERE user_id = ${userId}::uuid AND is_active = true
      `;
    }

    return isValid;
  }

  /**
   * Verify a backup code (single use)
   *
   * @param userId - User ID
   * @param backupCode - Backup recovery code
   * @returns true if valid (code is consumed)
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    const mfaRecords = await this.prisma.$queryRaw<
      Array<{
        id: string;
        backup_codes_hash: string;
      }>
    >`
      SELECT id, backup_codes_hash
      FROM user_mfa
      WHERE user_id = ${userId}::uuid AND is_active = true
      LIMIT 1
    `;

    if (mfaRecords.length === 0) {
      return false;
    }

    const mfaRecord = mfaRecords[0];
    if (!mfaRecord) {
      return false;
    }

    const hashedCodes: string[] = JSON.parse(mfaRecord.backup_codes_hash);
    const normalizedCode = this.normalizeBackupCode(backupCode);

    // Find matching backup code
    for (let i = 0; i < hashedCodes.length; i++) {
      const hashedCode = hashedCodes[i];
      if (!hashedCode) continue;

      const isMatch = await this.verifyBackupCodeHash(normalizedCode, hashedCode);
      if (isMatch) {
        // Remove used code
        hashedCodes.splice(i, 1);

        await this.prisma.$executeRaw`
          UPDATE user_mfa
          SET backup_codes_hash = ${JSON.stringify(hashedCodes)}, updated_at = NOW()
          WHERE id = ${mfaRecord.id}::uuid
        `;

        this.logger.warn(`Backup code used for user ${userId}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Disable MFA for a user
   *
   * @param userId - User ID
   * @param password - User's password for verification
   */
  async disableMfa(userId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE user_mfa
      SET is_active = false, updated_at = NOW()
      WHERE user_id = ${userId}::uuid AND is_active = true
    `;

    await this.prisma.$executeRaw`
      UPDATE users
      SET mfa_enabled = false, updated_at = NOW()
      WHERE id = ${userId}::uuid
    `;

    this.logger.log(`MFA disabled for user ${userId}`);
  }

  /**
   * Regenerate backup codes
   *
   * @param userId - User ID
   * @returns New backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

    await this.prisma.$executeRaw`
      UPDATE user_mfa
      SET backup_codes_hash = ${JSON.stringify(hashedBackupCodes)}, updated_at = NOW()
      WHERE user_id = ${userId}::uuid AND is_active = true
    `;

    this.logger.log(`Backup codes regenerated for user ${userId}`);
    return backupCodes;
  }

  /**
   * Check if user has MFA enabled
   */
  async isMfaEnabled(userId: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM user_mfa
      WHERE user_id = ${userId}::uuid AND is_active = true
    `;

    return result[0] ? Number(result[0].count) > 0 : false;
  }

  // Private helper methods

  private verifyTotp(secret: string, code: string): boolean {
    const totp = new OTPAuth.TOTP({
      issuer: this.issuer,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });

    // Allow 1 window before/after for clock drift
    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(5).toString('hex').toUpperCase();
      // Format as XXXX-XXXX for readability
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  private async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(
      codes.map(async (code) => {
        const normalized = this.normalizeBackupCode(code);
        return crypto.createHash('sha256').update(normalized).digest('hex');
      }),
    );
  }

  private async verifyBackupCodeHash(
    code: string,
    hash: string,
  ): Promise<boolean> {
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(codeHash),
      Buffer.from(hash),
    );
  }

  private normalizeBackupCode(code: string): string {
    return code.replace(/[-\s]/g, '').toUpperCase();
  }

  private encryptSecret(secret: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  private decryptSecret(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      iv,
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private formatManualEntry(secret: string): string {
    // Format secret in groups of 4 for easier manual entry
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  }
}
