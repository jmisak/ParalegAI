import { Injectable, Logger } from '@nestjs/common';
import {
  Policy,
  PolicyContext,
  PolicyDecision,
  PolicyEffect,
  SubjectAttributes,
  ResourceAttributes,
  Action,
} from './abac.types';
import { CORE_POLICIES } from './policies';

/**
 * ABAC Policy Engine
 *
 * Evaluates access control policies based on subject, resource,
 * action, and environment attributes. Implements deny-override
 * combining algorithm.
 *
 * @security CRITICAL - Authorization decisions flow through this service
 */
@Injectable()
export class AbacService {
  private readonly logger = new Logger(AbacService.name);
  private readonly policies: Policy[];

  constructor() {
    // Sort policies by priority (lowest number = highest priority)
    this.policies = [...CORE_POLICIES].sort((a, b) => a.priority - b.priority);
    this.logger.log(`ABAC engine initialized with ${this.policies.length} policies`);
  }

  /**
   * Evaluate whether an action is allowed
   *
   * Uses deny-override algorithm:
   * 1. All DENY policies are checked first - any match results in denial
   * 2. Then ALLOW policies are checked - first match results in approval
   * 3. Default is DENY (explicit deny by default)
   */
  evaluate(context: PolicyContext): PolicyDecision {
    // Phase 1: Check all DENY policies
    const denyPolicies = this.policies.filter(
      (p) => p.effect === PolicyEffect.DENY,
    );

    for (const policy of denyPolicies) {
      try {
        if (policy.condition(context)) {
          this.logger.debug(
            `DENY by policy "${policy.name}" for ${context.action} on ${context.resource.type}`,
          );
          return {
            allowed: false,
            matchedPolicy: policy.name,
            reason: policy.description,
          };
        }
      } catch (error) {
        this.logger.error(
          `Policy evaluation error in "${policy.name}": ${error}`,
        );
        // Fail closed - deny on error
        return {
          allowed: false,
          matchedPolicy: policy.name,
          reason: 'Policy evaluation error - access denied',
        };
      }
    }

    // Phase 2: Check ALLOW policies
    const allowPolicies = this.policies.filter(
      (p) => p.effect === PolicyEffect.ALLOW,
    );

    for (const policy of allowPolicies) {
      try {
        if (policy.condition(context)) {
          this.logger.debug(
            `ALLOW by policy "${policy.name}" for ${context.action} on ${context.resource.type}`,
          );
          return {
            allowed: true,
            matchedPolicy: policy.name,
          };
        }
      } catch (error) {
        this.logger.error(
          `Policy evaluation error in "${policy.name}": ${error}`,
        );
        // Continue to next policy
      }
    }

    // Default: DENY
    this.logger.debug(
      `DEFAULT DENY: No matching policy for ${context.action} on ${context.resource.type}`,
    );
    return {
      allowed: false,
      reason: 'No matching policy - access denied by default',
    };
  }

  /**
   * Quick permission check with simplified inputs
   */
  can(
    subject: SubjectAttributes,
    action: Action,
    resource: ResourceAttributes,
    mfaVerified = false,
  ): boolean {
    const context: PolicyContext = {
      subject,
      resource,
      action,
      environment: {
        timestamp: new Date(),
        mfaVerified,
      },
    };

    return this.evaluate(context).allowed;
  }

  /**
   * Check multiple permissions at once
   * Returns a map of action -> allowed
   */
  canMultiple(
    subject: SubjectAttributes,
    actions: Action[],
    resource: ResourceAttributes,
    mfaVerified = false,
  ): Record<Action, boolean> {
    const result: Partial<Record<Action, boolean>> = {};

    for (const action of actions) {
      result[action] = this.can(subject, action, resource, mfaVerified);
    }

    return result as Record<Action, boolean>;
  }

  /**
   * Get all registered policy names (for debugging/admin)
   */
  listPolicies(): Array<{ name: string; description: string; effect: string; priority: number }> {
    return this.policies.map((p) => ({
      name: p.name,
      description: p.description,
      effect: p.effect,
      priority: p.priority,
    }));
  }
}
