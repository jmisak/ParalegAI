import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionService } from './session.service';
import { MfaService, MfaController } from './mfa';
import { AbacService, AbacGuard } from './abac';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
          issuer: 'ironclad-api',
          audience: 'ironclad-client',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, MfaController],
  providers: [
    AuthService,
    SessionService,
    JwtStrategy,
    LocalStrategy,
    MfaService,
    AbacService,
    AbacGuard,
  ],
  exports: [AuthService, SessionService, JwtModule, MfaService, AbacService, AbacGuard],
})
export class AuthModule {}
