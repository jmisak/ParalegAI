import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '@common/decorators';
import { AuthenticatedRequest } from '@common/interfaces';

/**
 * Role-Based Access Control Guard
 * Checks if the user has at least one of the required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    // Super admin bypasses all role checks
    if (user.roles.includes(Role.SUPER_ADMIN)) {
      return true;
    }

    // Check if user has at least one required role
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
