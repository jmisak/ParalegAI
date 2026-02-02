/**
 * Attorney-Client Privilege Guard
 * OWASP Reference: A01:2021 - Broken Access Control
 *
 * Implements:
 * - Attorney-client privilege verification
 * - Work product doctrine protection
 * - Privilege logging for audit trails
 * - Privilege waiver detection
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

/**
 * Privilege classification levels
 */
export enum PrivilegeClassification {
  /** Public - no privilege protection */
  PUBLIC = 'PUBLIC',
  /** Internal - organizational confidential */
  INTERNAL = 'INTERNAL',
  /** Confidential - client confidential */
  CONFIDENTIAL = 'CONFIDENTIAL',
  /** Attorney-Client Privileged */
  PRIVILEGED = 'PRIVILEGED',
  /** Work Product - attorney mental impressions */
  WORK_PRODUCT = 'WORK_PRODUCT',
  /** Joint Defense - shared privilege */
  JOINT_DEFENSE = 'JOINT_DEFENSE',
}

/**
 * Privilege metadata for documents/records
 */
export interface PrivilegeMetadata {
  /** Classification level */
  classification: PrivilegeClassification;
  /** Attorney of record */
  attorneyId?: string;
  /** Client ID */
  clientId?: string;
  /** Matter ID */
  matterId?: string;
  /** Privilege assertion date */
  assertedAt?: Date;
  /** Privilege review date */
  reviewedAt?: Date;
  /** Reviewed by (attorney ID) */
  reviewedBy?: string;
  /** Privilege notes */
  notes?: string;
  /** Joint defense group ID (if applicable) */
  jointDefenseGroupId?: string;
  /** Waiver status */
  waived: boolean;
  /** Waiver date */
  waivedAt?: Date;
  /** Waiver reason */
  waiverReason?: string;
}

/**
 * Privilege check result
 */
export interface PrivilegeCheckResult {
  allowed: boolean;
  classification: PrivilegeClassification;
  reason?: string;
  requiresLogging: boolean;
  waiverWarning?: string;
}

/**
 * User context for privilege checks
 */
export interface PrivilegeUserContext {
  userId: string;
  organizationId: string;
  roles: string[];
  isAttorney: boolean;
  barAdmissions?: string[]; // State bar memberships
  matterAccess: string[]; // Matter IDs user has access to
}

/**
 * Decorator key for privilege requirements
 */
export const PRIVILEGE_KEY = 'privilege_required';

/**
 * Privilege requirement decorator
 */
export function RequirePrivilegeAccess(
  minClassification: PrivilegeClassification,
  requireAttorney: boolean = false,
) {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(
      PRIVILEGE_KEY,
      { minClassification, requireAttorney },
      descriptor?.value ?? target,
    );
  };
}

@Injectable()
export class PrivilegeGuard implements CanActivate {
  private readonly logger = new Logger(PrivilegeGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.get<{
      minClassification: PrivilegeClassification;
      requireAttorney: boolean;
    }>(PRIVILEGE_KEY, context.getHandler());

    // No privilege requirement specified
    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as PrivilegeUserContext | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication required for privileged access');
    }

    // Extract resource metadata from request
    const resourceMetadata = await this.extractResourceMetadata(request);

    // Check privilege access
    const result = this.checkPrivilegeAccess(
      user,
      resourceMetadata,
      requirement.minClassification,
      requirement.requireAttorney,
    );

    // Log privilege access attempt
    if (result.requiresLogging) {
      this.logPrivilegeAccess(user, resourceMetadata, result);
    }

    if (!result.allowed) {
      throw new ForbiddenException(result.reason || 'Privileged access denied');
    }

    // Attach privilege context to request
    (request as any).privilegeContext = {
      classification: resourceMetadata?.classification,
      checkResult: result,
    };

    return true;
  }

  /**
   * Extract privilege metadata from request/resource
   */
  private async extractResourceMetadata(
    request: Request,
  ): Promise<PrivilegeMetadata | null> {
    // This would typically fetch from database based on resource ID
    // For now, check request body/params for privilege metadata
    const resourceId = request.params?.id || request.params?.documentId;

    if (!resourceId) {
      return null;
    }

    // Placeholder: In production, fetch from database
    // const resource = await this.resourceService.getPrivilegeMetadata(resourceId);
    // return resource;

    return null;
  }

  /**
   * Check if user has privilege access
   */
  checkPrivilegeAccess(
    user: PrivilegeUserContext,
    resourceMetadata: PrivilegeMetadata | null,
    requiredClassification: PrivilegeClassification,
    requireAttorney: boolean,
  ): PrivilegeCheckResult {
    // No resource metadata - check role-based access only
    if (!resourceMetadata) {
      return this.checkRoleBasedAccess(user, requiredClassification, requireAttorney);
    }

    // Check for privilege waiver
    if (resourceMetadata.waived) {
      return {
        allowed: true,
        classification: resourceMetadata.classification,
        requiresLogging: true,
        waiverWarning: `Privilege waived on ${resourceMetadata.waivedAt}: ${resourceMetadata.waiverReason}`,
      };
    }

    // Classification hierarchy check
    const classificationOrder = [
      PrivilegeClassification.PUBLIC,
      PrivilegeClassification.INTERNAL,
      PrivilegeClassification.CONFIDENTIAL,
      PrivilegeClassification.PRIVILEGED,
      PrivilegeClassification.WORK_PRODUCT,
      PrivilegeClassification.JOINT_DEFENSE,
    ];

    const resourceLevel = classificationOrder.indexOf(resourceMetadata.classification);
    const requiredLevel = classificationOrder.indexOf(requiredClassification);

    // Resource is less sensitive than required - allow
    if (resourceLevel < requiredLevel) {
      return {
        allowed: true,
        classification: resourceMetadata.classification,
        requiresLogging: resourceLevel >= 3, // Log PRIVILEGED and above
      };
    }

    // Attorney requirement check
    if (requireAttorney && !user.isAttorney) {
      return {
        allowed: false,
        classification: resourceMetadata.classification,
        reason: 'Attorney status required for privileged access',
        requiresLogging: true,
      };
    }

    // Matter access check
    if (resourceMetadata.matterId && !user.matterAccess.includes(resourceMetadata.matterId)) {
      return {
        allowed: false,
        classification: resourceMetadata.classification,
        reason: 'User does not have access to this matter',
        requiresLogging: true,
      };
    }

    // Joint defense check
    if (resourceMetadata.classification === PrivilegeClassification.JOINT_DEFENSE) {
      // Would check joint defense group membership
      // Placeholder: In production, verify group membership
    }

    // Work product check - only authoring attorney or designated reviewers
    if (resourceMetadata.classification === PrivilegeClassification.WORK_PRODUCT) {
      if (resourceMetadata.attorneyId !== user.userId) {
        // Check if user is a designated reviewer
        // Placeholder: In production, check reviewer list
        return {
          allowed: false,
          classification: resourceMetadata.classification,
          reason: 'Work product access restricted to authoring attorney',
          requiresLogging: true,
        };
      }
    }

    return {
      allowed: true,
      classification: resourceMetadata.classification,
      requiresLogging: true,
    };
  }

  /**
   * Check role-based access when no resource metadata available
   */
  private checkRoleBasedAccess(
    user: PrivilegeUserContext,
    requiredClassification: PrivilegeClassification,
    requireAttorney: boolean,
  ): PrivilegeCheckResult {
    if (requireAttorney && !user.isAttorney) {
      return {
        allowed: false,
        classification: requiredClassification,
        reason: 'Attorney status required',
        requiresLogging: true,
      };
    }

    // Check role permissions
    const privilegeRoles = ['attorney', 'partner', 'admin'];
    const hasPrivilegeRole = user.roles.some((role) => privilegeRoles.includes(role.toLowerCase()));

    if (requiredClassification === PrivilegeClassification.PRIVILEGED && !hasPrivilegeRole) {
      return {
        allowed: false,
        classification: requiredClassification,
        reason: 'Insufficient role for privileged access',
        requiresLogging: true,
      };
    }

    return {
      allowed: true,
      classification: requiredClassification,
      requiresLogging: requiredClassification !== PrivilegeClassification.PUBLIC,
    };
  }

  /**
   * Log privilege access for audit trail
   */
  private logPrivilegeAccess(
    user: PrivilegeUserContext,
    resourceMetadata: PrivilegeMetadata | null,
    result: PrivilegeCheckResult,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: user.userId,
      organizationId: user.organizationId,
      isAttorney: user.isAttorney,
      classification: result.classification,
      allowed: result.allowed,
      reason: result.reason,
      matterId: resourceMetadata?.matterId,
      waiverWarning: result.waiverWarning,
    };

    // In production, send to secure audit log system
    this.logger.log(`[PRIVILEGE_ACCESS] ${JSON.stringify(logEntry)}`);
  }
}

export default PrivilegeGuard;
