import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext, AuthenticatedRequest } from '@common/interfaces';

/**
 * Extracts the current tenant context from the request
 * @example
 * ```typescript
 * @Get('settings')
 * getSettings(@Tenant() tenant: TenantContext) {
 *   return tenant;
 * }
 *
 * // Extract specific property
 * @Get('org-id')
 * getOrgId(@Tenant('organizationId') orgId: string) {
 *   return orgId;
 * }
 * ```
 */
export const Tenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const tenant = request.tenant;

    if (!tenant) {
      return null;
    }

    return data ? tenant[data] : tenant;
  },
);

/**
 * Shorthand decorator to get just the organization ID
 */
export const OrganizationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.tenant?.organizationId || request.user?.organizationId || null;
  },
);
