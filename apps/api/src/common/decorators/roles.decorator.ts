import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Available system roles
 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ATTORNEY = 'attorney',
  PARALEGAL = 'paralegal',
  STAFF = 'staff',
  CLIENT = 'client',
}

/**
 * Decorator to specify required roles for an endpoint
 * @example
 * ```typescript
 * @Roles(Role.ADMIN, Role.ATTORNEY)
 * @Get('sensitive')
 * getSensitiveData() {}
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
