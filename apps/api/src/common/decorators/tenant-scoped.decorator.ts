import { SetMetadata, applyDecorators } from '@nestjs/common';

/**
 * Metadata key for tenant-scoped routes
 */
export const TENANT_SCOPED_KEY = 'isTenantScoped';

/**
 * Options for TenantScoped decorator
 */
export interface TenantScopedOptions {
  /** Whether to include the TenantGuard (default: true) */
  includeTenantGuard?: boolean;
  /** Require tenant to be in active status (default: true) */
  requireActive?: boolean;
}

/**
 * Marks a route or controller as requiring tenant context for RLS
 *
 * @example
 * ```typescript
 * @TenantScoped()
 * @Controller('matters')
 * export class MatterController { ... }
 * ```
 */
export function TenantScoped(
  _options?: TenantScopedOptions,
): MethodDecorator & ClassDecorator {
  const decorators: Array<ClassDecorator | MethodDecorator> = [
    SetMetadata(TENANT_SCOPED_KEY, true),
  ];

  return applyDecorators(...decorators);
}

/**
 * Lightweight decorator - only sets RLS context without loading full tenant data
 */
export function RequiresTenant(): MethodDecorator & ClassDecorator {
  return SetMetadata(TENANT_SCOPED_KEY, true);
}
