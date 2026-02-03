import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsString, Length, IsIn, IsBoolean, IsOptional, IsJWT } from 'class-validator';
import { Public } from '@common/decorators';
import { MfaService } from './mfa.service';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '@common/interfaces';

/**
 * DTO for MFA code verification (enrollment)
 */
class VerifyMfaDto {
  @IsString()
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  code!: string;
}

/**
 * DTO for login-time MFA verification
 */
class LoginMfaVerifyDto {
  @IsString()
  mfaToken!: string;

  @IsString()
  @Length(1, 64)
  code!: string;

  @IsIn(['totp', 'backup'])
  type!: 'totp' | 'backup';

  @IsOptional()
  @IsBoolean()
  rememberDevice?: boolean;
}

/**
 * MFA Controller
 *
 * Endpoints for managing multi-factor authentication
 */
@Controller('auth/mfa')
export class MfaController {
  constructor(
    private readonly mfaService: MfaService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Verify MFA code during login
   * This is a public endpoint — authentication is via the short-lived mfaToken
   */
  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyLogin(@Body() dto: LoginMfaVerifyDto) {
    return this.authService.verifyMfaLogin(dto.mfaToken, dto.code, dto.type);
  }

  /**
   * Begin MFA enrollment
   * Returns QR code and backup codes
   */
  @UseGuards(JwtAuthGuard)
  @Post('enroll')
  async enrollMfa(@CurrentUser() user: JwtPayload) {
    return this.mfaService.enrollMfa(user.sub, user.email);
  }

  /**
   * Verify and activate MFA enrollment
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify-enrollment')
  @HttpCode(HttpStatus.OK)
  async verifyEnrollment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VerifyMfaDto,
  ) {
    await this.mfaService.verifyEnrollment(user.sub, dto.code);
    return { message: 'MFA successfully enabled' };
  }

  /**
   * Disable MFA
   */
  @UseGuards(JwtAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async disableMfa(@CurrentUser() user: JwtPayload) {
    await this.mfaService.disableMfa(user.sub);
    return { message: 'MFA disabled' };
  }

  /**
   * Regenerate backup codes
   */
  @UseGuards(JwtAuthGuard)
  @Post('backup-codes/regenerate')
  async regenerateBackupCodes(@CurrentUser() user: JwtPayload) {
    const codes = await this.mfaService.regenerateBackupCodes(user.sub);
    return { backupCodes: codes };
  }

  /**
   * Check MFA status
   */
  @UseGuards(JwtAuthGuard)
  @Post('status')
  @HttpCode(HttpStatus.OK)
  async getMfaStatus(@CurrentUser() user: JwtPayload) {
    const enabled = await this.mfaService.isMfaEnabled(user.sub);
    return { mfaEnabled: enabled };
  }
}
