/**
 * ABAC (Attribute-Based Access Control) Type Definitions
 *
 * Implements a policy-based authorization system where access decisions
 * are based on attributes of the subject, resource, action, and environment.
 */

/**
 * Supported resource types in the system
 */
export type ResourceType =
  | 'matter'
  | 'document'
  | 'document_template'
  | 'party'
  | 'transaction'
  | 'trust_account'
  | 'trust_transaction'
  | 'task'
  | 'workflow'
  | 'user'
  | 'organization'
  | 'communication'
  | 'time_entry'
  | 'audit_log';

/**
 * Supported actions
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'list' | 'assign' | 'approve' | 'export';

/**
 * Subject attributes (the user making the request)
 */
export interface SubjectAttributes {
  id: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  departmentId?: string;
  teamIds?: string[];
}

/**
 * Resource attributes (the entity being accessed)
 */
export interface ResourceAttributes {
  type: ResourceType;
  id?: string;
  organizationId: string;
  ownerId?: string;
  assignedTo?: string[];
  department?: string;
  status?: string;
  confidentialityLevel?: 'standard' | 'confidential' | 'privileged';
  conflictPartyIds?: string[];
}

/**
 * Environment attributes (contextual information)
 */
export interface EnvironmentAttributes {
  timestamp: Date;
  ipAddress?: string;
  mfaVerified: boolean;
  sessionAge?: number;
}

/**
 * Policy evaluation context
 */
export interface PolicyContext {
  subject: SubjectAttributes;
  resource: ResourceAttributes;
  action: Action;
  environment: EnvironmentAttributes;
}

/**
 * Policy decision
 */
export enum PolicyEffect {
  ALLOW = 'allow',
  DENY = 'deny',
}

/**
 * Single policy definition
 */
export interface Policy {
  name: string;
  description: string;
  effect: PolicyEffect;
  priority: number;
  condition: (ctx: PolicyContext) => boolean;
}

/**
 * Policy evaluation result
 */
export interface PolicyDecision {
  allowed: boolean;
  matchedPolicy?: string;
  reason?: string;
}
