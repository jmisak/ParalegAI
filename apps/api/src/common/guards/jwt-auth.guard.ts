import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators';

/**
 * JWT Authentication Guard
 * Validates JWT tokens and allows public routes to bypass authentication
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
    info: Error | undefined,
  ): TUser {
    if (err || !user) {
      const message = this.getErrorMessage(info);
      throw new UnauthorizedException(message);
    }
    return user;
  }

  private getErrorMessage(info: Error | undefined): string {
    if (!info) {
      return 'Authentication required';
    }

    if (info.name === 'TokenExpiredError') {
      return 'Token has expired';
    }

    if (info.name === 'JsonWebTokenError') {
      return 'Invalid token';
    }

    return info.message || 'Authentication failed';
  }
}
