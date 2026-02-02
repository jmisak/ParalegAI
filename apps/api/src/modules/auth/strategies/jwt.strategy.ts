import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@common/interfaces';
import { SessionService } from '../session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      issuer: 'ironclad-api',
      audience: 'ironclad-client',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Validate session is still active
    const isValid = await this.sessionService.isValidSession(payload.sessionId);
    if (!isValid) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // Touch session to update last activity
    await this.sessionService.touchSession(payload.sessionId);

    return payload;
  }
}
