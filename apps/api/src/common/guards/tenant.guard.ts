import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedRequest, TenantContext } from '@common/interfaces';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Tenant Guard
 * Ensures user has access to the tenant context and populates tenant data
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check for tenant header override (for super admins)
    const tenantHeader = request.headers['x-tenant-id'] as string | undefined;
    const organizationId = tenantHeader || user.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Tenant context not found');
    }

    // If using header override, validate super admin status
    if (tenantHeader && tenantHeader !== user.organizationId) {
      if (!user.roles?.includes('super_admin')) {
        throw new ForbiddenException(
          'Only super admins can switch tenant context',
        );
      }
    }

    // Load tenant context from database
    const tenant = await this.loadTenantContext(organizationId);

    if (!tenant) {
      throw new ForbiddenException('Organization not found or inactive');
    }

    // Attach tenant context to request
    request.tenant = tenant;

    return true;
  }

  private async loadTenantContext(
    organizationId: string,
  ): Promise<TenantContext | null> {
    try {
      // This query will be replaced with actual Prisma query once schema is defined
      // For now, return mock data structure
      const org = await this.prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          subscription_tier: string;
          features: string[];
          is_active: boolean;
        }>
      >`
        SELECT id, name, subscription_tier, features, is_active
        FROM organizations
        WHERE id = ${organizationId}::uuid AND deleted_at IS NULL
        LIMIT 1
      `;

      if (!org[0] || !org[0].is_active) {
        return null;
      }

      return {
        organizationId: org[0].id,
        organizationName: org[0].name,
        subscriptionTier: org[0].subscription_tier as TenantContext['subscriptionTier'],
        features: org[0].features || [],
      };
    } catch {
      // In production, fail closed — deny access if tenant lookup fails
      // In development, return minimal context so the app is usable before seeding
      const nodeEnv = process.env.NODE_ENV || 'development';
      if (nodeEnv === 'production') {
        return null;
      }

      return {
        organizationId,
        organizationName: 'Development Org',
        subscriptionTier: 'professional' as TenantContext['subscriptionTier'],
        features: [],
      };
    }
  }
}
