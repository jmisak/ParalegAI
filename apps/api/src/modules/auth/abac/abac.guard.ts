import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbacService } from './abac.service';
import {
  Action,
  ResourceType,
  SubjectAttributes,
  ResourceAttributes,
} from './abac.types';

/**
 * Metadata key for ABAC policy decorator
 */
export const ABAC_POLICY_KEY = 'abac_policy';

/**
 * ABAC policy metadata
 */
export interface AbacPolicyMetadata {
  action: Action;
  resourceType: ResourceType;
  /** Function to extract resource attributes from request */
  getResource?: (request: unknown) => Partial<ResourceAttributes>;
}

/**
 * ABAC Guard
 *
 * Enforces attribute-based access control on protected routes.
 * Use with the @AbacPolicy() decorator.
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, AbacGuard)
 * @AbacPolicy({ action: 'update', resourceType: 'matter' })
 * @Patch(':id')
 * updateMatter(@Param('id') id: string) { ... }
 * ```
 */
@Injectable()
export class AbacGuard implements CanActivate {
  private readonly logger = new Logger(AbacGuard.name);

  constructor(
    private readonly abacService: AbacService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const policyMeta = this.reflector.get<AbacPolicyMetadata>(
      ABAC_POLICY_KEY,
      context.getHandler(),
    );

    // If no policy metadata, allow (guard is not configured for this route)
    if (!policyMeta) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const subject: SubjectAttributes = {
      id: user.sub,
      organizationId: user.organizationId,
      roles: user.roles || [],
      permissions: user.permissions || [],
    };

    // Build resource attributes
    let resourceAttrs: ResourceAttributes = {
      type: policyMeta.resourceType,
      organizationId: user.organizationId,
    };

    // Apply custom resource extraction if provided
    if (policyMeta.getResource) {
      const customAttrs = policyMeta.getResource(request);
      resourceAttrs = { ...resourceAttrs, ...customAttrs };
    }

    const decision = this.abacService.evaluate({
      subject,
      resource: resourceAttrs,
      action: policyMeta.action,
      environment: {
        timestamp: new Date(),
        ipAddress: request.ip,
        mfaVerified: user.mfaVerified ?? false,
      },
    });

    if (!decision.allowed) {
      this.logger.warn(
        `Access denied: user=${user.sub} action=${policyMeta.action} ` +
        `resource=${policyMeta.resourceType} policy=${decision.matchedPolicy || 'default_deny'}`,
      );
      throw new ForbiddenException(decision.reason || 'Access denied');
    }

    return true;
  }
}
