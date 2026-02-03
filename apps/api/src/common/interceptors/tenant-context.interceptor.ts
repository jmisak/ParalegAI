import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { TENANT_SCOPED_KEY } from '../decorators/tenant-scoped.decorator';

/**
 * Authenticated request with user and tenant context
 */
interface AuthenticatedRequest {
  user?: {
    sub: string;
    organizationId?: string;
    roles?: string[];
  };
  tenant?: {
    organizationId: string;
  };
  headers: Record<string, string | string[] | undefined>;
  method: string;
  url: string;
}

/**
 * Tenant Context Interceptor
 *
 * Sets PostgreSQL session variable for Row-Level Security (RLS) before
 * controller execution. This ensures all database queries within the
 * request are automatically scoped to the authenticated user's tenant.
 *
 * @security This interceptor is critical for multi-tenant data isolation.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantContextInterceptor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Intercepts incoming requests and sets tenant context for RLS
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // Check if route requires tenant scoping
    const isTenantScoped = this.reflector.getAllAndOverride<boolean>(
      TENANT_SCOPED_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Skip tenant context for non-tenant-scoped routes or unauthenticated requests
    if (!isTenantScoped || !user) {
      return next.handle();
    }

    const organizationId = this.extractOrganizationId(request);

    if (!organizationId) {
      this.logger.warn(
        `Tenant context missing for user ${user.sub} on ${request.method} ${request.url}`,
      );
      throw new ForbiddenException('Tenant context is required for this operation');
    }

    // Validate UUID format to prevent injection
    if (!this.isValidUuid(organizationId)) {
      this.logger.error(`Invalid organization ID format: ${organizationId.substring(0, 50)}`);
      throw new ForbiddenException('Invalid tenant identifier');
    }

    return from(this.setTenantContext(organizationId)).pipe(
      switchMap(() => {
        this.logger.debug(
          `Tenant context set: ${organizationId} for ${request.method} ${request.url}`,
        );
        return next.handle();
      }),
    );
  }

  /**
   * Extracts organization ID from request, supporting header override for super admins
   */
  private extractOrganizationId(request: AuthenticatedRequest): string | null {
    const user = request.user;
    if (!user) return null;

    const tenantHeader = request.headers['x-tenant-id'] as string | undefined;

    if (tenantHeader && user.roles?.includes('super_admin')) {
      return tenantHeader;
    }

    if (request.tenant?.organizationId) {
      return request.tenant.organizationId;
    }

    return user.organizationId || null;
  }

  /**
   * Sets PostgreSQL session variable for RLS
   * @security Uses parameterized query to prevent SQL injection
   */
  private async setTenantContext(organizationId: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        SELECT set_config('app.current_organization_id', ${organizationId}, true)
      `;
    } catch (error) {
      this.logger.error(
        `Failed to set tenant context: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new ForbiddenException('Failed to establish tenant context');
    }
  }

  /**
   * Validates UUID format
   */
  private isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
