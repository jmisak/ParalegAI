/**
 * Chinese Wall / Conflict of Interest Guard
 * OWASP Reference: A01:2021 - Broken Access Control
 *
 * Implements:
 * - Ethical wall enforcement between conflicting matters
 * - Conflict of interest detection
 * - Information barrier monitoring
 * - Conflict screening audit trail
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
 * Conflict type classifications
 */
export enum ConflictType {
  /** Direct adverse representation */
  DIRECT_ADVERSE = 'DIRECT_ADVERSE',
  /** Material limitation conflict */
  MATERIAL_LIMITATION = 'MATERIAL_LIMITATION',
  /** Former client conflict */
  FORMER_CLIENT = 'FORMER_CLIENT',
  /** Imputed conflict (firm-wide) */
  IMPUTED = 'IMPUTED',
  /** Prospective client conflict */
  PROSPECTIVE = 'PROSPECTIVE',
  /** Business transaction conflict */
  BUSINESS_TRANSACTION = 'BUSINESS_TRANSACTION',
  /** Third-party payer conflict */
  THIRD_PARTY_PAYER = 'THIRD_PARTY_PAYER',
}

/**
 * Conflict status
 */
export enum ConflictStatus {
  /** Active conflict - access blocked */
  ACTIVE = 'ACTIVE',
  /** Waived with informed consent */
  WAIVED = 'WAIVED',
  /** Screened - Chinese wall in place */
  SCREENED = 'SCREENED',
  /** Cleared - no conflict exists */
  CLEARED = 'CLEARED',
  /** Pending review */
  PENDING_REVIEW = 'PENDING_REVIEW',
}

/**
 * Chinese wall configuration for a user
 */
export interface ChineseWallConfig {
  /** User ID */
  userId: string;
  /** Matters user is walled off from */
  walledMatters: string[];
  /** Clients user is walled off from */
  walledClients: string[];
  /** Opposing parties user is walled off from */
  walledParties: string[];
  /** Wall creation date */
  createdAt: Date;
  /** Wall expiration (if any) */
  expiresAt?: Date;
  /** Wall creation reason */
  reason: string;
  /** Approved by (partner/ethics officer) */
  approvedBy: string;
  /** Wall effectiveness certification dates */
  certifications: Date[];
}

/**
 * Conflict check record
 */
export interface ConflictCheckRecord {
  /** Unique check ID */
  id: string;
  /** User requesting access */
  userId: string;
  /** Matter being accessed */
  matterId: string;
  /** Client involved */
  clientId: string;
  /** Opposing parties */
  opposingParties: string[];
  /** Check timestamp */
  checkedAt: Date;
  /** Conflict detected */
  conflictDetected: boolean;
  /** Conflict type (if detected) */
  conflictType?: ConflictType;
  /** Conflict status */
  status: ConflictStatus;
  /** Access granted */
  accessGranted: boolean;
  /** Denial reason */
  denialReason?: string;
  /** Waiver reference (if applicable) */
  waiverId?: string;
  /** Screen reference (if applicable) */
  screenId?: string;
}

/**
 * User conflict context
 */
export interface ConflictUserContext {
  userId: string;
  organizationId: string;
  /** User's active matters */
  activeMatters: string[];
  /** User's clients */
  clients: string[];
  /** User's former clients */
  formerClients: string[];
  /** Chinese wall configuration */
  chineseWall?: ChineseWallConfig;
  /** Conflict waivers on file */
  waivers: string[];
}

/**
 * Matter conflict metadata
 */
export interface MatterConflictMetadata {
  matterId: string;
  clientId: string;
  opposingParties: string[];
  relatedMatters: string[];
  conflictChecked: boolean;
  lastConflictCheck: Date;
}

/**
 * Decorator key for conflict check requirement
 */
export const CONFLICT_CHECK_KEY = 'conflict_check_required';

/**
 * Require conflict check decorator
 */
export function RequireConflictCheck() {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(CONFLICT_CHECK_KEY, true, descriptor?.value ?? target);
  };
}

@Injectable()
export class ConflictGuard implements CanActivate {
  private readonly logger = new Logger(ConflictGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresConflictCheck = this.reflector.get<boolean>(
      CONFLICT_CHECK_KEY,
      context.getHandler(),
    );

    if (!requiresConflictCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as ConflictUserContext | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication required for conflict check');
    }

    // Extract matter/client context from request
    const matterContext = await this.extractMatterContext(request);

    if (!matterContext) {
      // No matter context - allow access but log
      this.logger.warn(`Conflict check skipped - no matter context for ${request.path}`);
      return true;
    }

    // Perform conflict check
    const result = await this.performConflictCheck(user, matterContext);

    // Log the conflict check
    this.logConflictCheck(result);

    if (!result.accessGranted) {
      throw new ForbiddenException({
        message: 'Access denied due to conflict of interest',
        code: 'CONFLICT_OF_INTEREST',
        conflictType: result.conflictType,
        reason: result.denialReason,
      });
    }

    // Attach conflict context to request
    (request as any).conflictContext = {
      checked: true,
      matterId: matterContext.matterId,
      result,
    };

    return true;
  }

  /**
   * Extract matter context from request
   */
  private async extractMatterContext(
    request: Request,
  ): Promise<MatterConflictMetadata | null> {
    const matterId = request.params?.matterId || request.body?.matterId;

    if (!matterId) {
      return null;
    }

    // Placeholder: In production, fetch from database
    // const matter = await this.matterService.getConflictMetadata(matterId);
    // return matter;

    return null;
  }

  /**
   * Perform comprehensive conflict check
   */
  async performConflictCheck(
    user: ConflictUserContext,
    matter: MatterConflictMetadata,
  ): Promise<ConflictCheckRecord> {
    const checkId = this.generateCheckId();
    const now = new Date();

    // Check Chinese wall restrictions
    if (user.chineseWall) {
      const wallViolation = this.checkChineseWall(user.chineseWall, matter);
      if (wallViolation) {
        return {
          id: checkId,
          userId: user.userId,
          matterId: matter.matterId,
          clientId: matter.clientId,
          opposingParties: matter.opposingParties,
          checkedAt: now,
          conflictDetected: true,
          conflictType: ConflictType.IMPUTED,
          status: ConflictStatus.SCREENED,
          accessGranted: false,
          denialReason: `Chinese wall violation: ${wallViolation}`,
          screenId: user.chineseWall.userId,
        };
      }
    }

    // Check direct adverse conflicts
    const adverseConflict = this.checkDirectAdverse(user, matter);
    if (adverseConflict) {
      // Check for waiver
      const hasWaiver = this.checkWaiver(user.waivers, matter.matterId, adverseConflict.type);

      if (hasWaiver) {
        return {
          id: checkId,
          userId: user.userId,
          matterId: matter.matterId,
          clientId: matter.clientId,
          opposingParties: matter.opposingParties,
          checkedAt: now,
          conflictDetected: true,
          conflictType: adverseConflict.type,
          status: ConflictStatus.WAIVED,
          accessGranted: true,
          waiverId: hasWaiver,
        };
      }

      return {
        id: checkId,
        userId: user.userId,
        matterId: matter.matterId,
        clientId: matter.clientId,
        opposingParties: matter.opposingParties,
        checkedAt: now,
        conflictDetected: true,
        conflictType: adverseConflict.type,
        status: ConflictStatus.ACTIVE,
        accessGranted: false,
        denialReason: adverseConflict.reason,
      };
    }

    // Check former client conflicts
    const formerClientConflict = this.checkFormerClientConflict(user, matter);
    if (formerClientConflict) {
      return {
        id: checkId,
        userId: user.userId,
        matterId: matter.matterId,
        clientId: matter.clientId,
        opposingParties: matter.opposingParties,
        checkedAt: now,
        conflictDetected: true,
        conflictType: ConflictType.FORMER_CLIENT,
        status: ConflictStatus.ACTIVE,
        accessGranted: false,
        denialReason: formerClientConflict,
      };
    }

    // No conflict detected
    return {
      id: checkId,
      userId: user.userId,
      matterId: matter.matterId,
      clientId: matter.clientId,
      opposingParties: matter.opposingParties,
      checkedAt: now,
      conflictDetected: false,
      status: ConflictStatus.CLEARED,
      accessGranted: true,
    };
  }

  /**
   * Check Chinese wall restrictions
   */
  private checkChineseWall(
    wall: ChineseWallConfig,
    matter: MatterConflictMetadata,
  ): string | null {
    // Check if wall has expired
    if (wall.expiresAt && wall.expiresAt < new Date()) {
      return null;
    }

    // Check matter wall
    if (wall.walledMatters.includes(matter.matterId)) {
      return `User is walled off from matter ${matter.matterId}`;
    }

    // Check client wall
    if (wall.walledClients.includes(matter.clientId)) {
      return `User is walled off from client ${matter.clientId}`;
    }

    // Check opposing party wall
    for (const party of matter.opposingParties) {
      if (wall.walledParties.includes(party)) {
        return `User is walled off from party ${party}`;
      }
    }

    return null;
  }

  /**
   * Check direct adverse conflicts
   */
  private checkDirectAdverse(
    user: ConflictUserContext,
    matter: MatterConflictMetadata,
  ): { type: ConflictType; reason: string } | null {
    // Check if user represents opposing party in another matter
    for (const clientId of user.clients) {
      if (matter.opposingParties.includes(clientId)) {
        return {
          type: ConflictType.DIRECT_ADVERSE,
          reason: `User represents ${clientId} who is an opposing party in this matter`,
        };
      }
    }

    // Check if matter's client is opposing party in user's other matters
    // This would require fetching user's other matters and their opposing parties
    // Placeholder for more comprehensive check

    return null;
  }

  /**
   * Check former client conflicts (Rule 1.9)
   */
  private checkFormerClientConflict(
    user: ConflictUserContext,
    matter: MatterConflictMetadata,
  ): string | null {
    // Check if current client was a former client's adversary
    for (const formerClientId of user.formerClients) {
      if (matter.opposingParties.includes(formerClientId)) {
        return `User formerly represented ${formerClientId} who is now an opposing party`;
      }
    }

    return null;
  }

  /**
   * Check for conflict waiver
   */
  private checkWaiver(
    waivers: string[],
    matterId: string,
    conflictType: ConflictType,
  ): string | null {
    // Placeholder: In production, fetch waiver details and verify validity
    // const waiver = await this.waiverService.findValidWaiver(waivers, matterId, conflictType);
    // return waiver?.id;
    return null;
  }

  /**
   * Generate unique check ID
   */
  private generateCheckId(): string {
    return `CHK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Log conflict check for audit trail
   */
  private logConflictCheck(record: ConflictCheckRecord): void {
    const logEntry = {
      checkId: record.id,
      timestamp: record.checkedAt.toISOString(),
      userId: record.userId,
      matterId: record.matterId,
      clientId: record.clientId,
      conflictDetected: record.conflictDetected,
      conflictType: record.conflictType,
      status: record.status,
      accessGranted: record.accessGranted,
      denialReason: record.denialReason,
    };

    // In production, send to secure audit log system
    if (record.conflictDetected) {
      this.logger.warn(`[CONFLICT_CHECK] ${JSON.stringify(logEntry)}`);
    } else {
      this.logger.log(`[CONFLICT_CHECK] ${JSON.stringify(logEntry)}`);
    }
  }
}

export default ConflictGuard;
