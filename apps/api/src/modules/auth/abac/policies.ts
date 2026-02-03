import { Policy, PolicyEffect, PolicyContext } from './abac.types';

/**
 * Core ABAC policies for IRONCLAD
 *
 * Policies are evaluated in priority order (lower number = higher priority).
 * DENY policies always take precedence over ALLOW policies at the same priority.
 */
export const CORE_POLICIES: Policy[] = [
  // =====================================================
  // DENY POLICIES (Priority 1-99) - These always win
  // =====================================================

  {
    name: 'deny-cross-tenant-access',
    description: 'Prevent access to resources outside the user\'s organization',
    effect: PolicyEffect.DENY,
    priority: 1,
    condition: (ctx: PolicyContext) =>
      ctx.subject.organizationId !== ctx.resource.organizationId,
  },

  {
    name: 'deny-audit-log-modification',
    description: 'Audit logs are immutable',
    effect: PolicyEffect.DENY,
    priority: 2,
    condition: (ctx: PolicyContext) =>
      ctx.resource.type === 'audit_log' &&
      (ctx.action === 'update' || ctx.action === 'delete'),
  },

  {
    name: 'deny-privileged-without-mfa',
    description: 'Privileged documents require MFA verification',
    effect: PolicyEffect.DENY,
    priority: 3,
    condition: (ctx: PolicyContext) =>
      ctx.resource.confidentialityLevel === 'privileged' &&
      !ctx.environment.mfaVerified,
  },

  {
    name: 'deny-conflict-of-interest',
    description: 'Chinese wall: prevent access to conflicting matters',
    effect: PolicyEffect.DENY,
    priority: 5,
    condition: (ctx: PolicyContext) => {
      if (!ctx.resource.conflictPartyIds || ctx.resource.conflictPartyIds.length === 0) {
        return false;
      }
      // This would check against the user's existing matter parties
      // For now, return false (no conflict detected)
      return false;
    },
  },

  // =====================================================
  // ADMIN POLICIES (Priority 100-199)
  // =====================================================

  {
    name: 'allow-super-admin-all',
    description: 'Super admins have full access within their organization',
    effect: PolicyEffect.ALLOW,
    priority: 100,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('super_admin') &&
      ctx.subject.organizationId === ctx.resource.organizationId,
  },

  {
    name: 'allow-admin-manage-users',
    description: 'Admins can manage users in their organization',
    effect: PolicyEffect.ALLOW,
    priority: 101,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('admin') &&
      ctx.resource.type === 'user' &&
      ctx.subject.organizationId === ctx.resource.organizationId,
  },

  {
    name: 'allow-admin-manage-organization',
    description: 'Admins can manage organization settings',
    effect: PolicyEffect.ALLOW,
    priority: 102,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('admin') &&
      ctx.resource.type === 'organization' &&
      ctx.subject.organizationId === ctx.resource.organizationId,
  },

  // =====================================================
  // ATTORNEY POLICIES (Priority 200-299)
  // =====================================================

  {
    name: 'allow-attorney-matter-access',
    description: 'Attorneys can access matters assigned to them',
    effect: PolicyEffect.ALLOW,
    priority: 200,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('attorney') &&
      ctx.resource.type === 'matter' &&
      (ctx.action === 'read' || ctx.action === 'update' || ctx.action === 'list') &&
      (ctx.resource.ownerId === ctx.subject.id ||
        ctx.resource.assignedTo?.includes(ctx.subject.id) === true),
  },

  {
    name: 'allow-attorney-create-matter',
    description: 'Attorneys can create new matters',
    effect: PolicyEffect.ALLOW,
    priority: 201,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('attorney') &&
      ctx.resource.type === 'matter' &&
      ctx.action === 'create',
  },

  {
    name: 'allow-attorney-document-access',
    description: 'Attorneys can manage documents on their matters',
    effect: PolicyEffect.ALLOW,
    priority: 202,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('attorney') &&
      (ctx.resource.type === 'document' || ctx.resource.type === 'document_template') &&
      (ctx.resource.ownerId === ctx.subject.id ||
        ctx.resource.assignedTo?.includes(ctx.subject.id) === true),
  },

  {
    name: 'allow-attorney-financial-read',
    description: 'Attorneys can view financial data on their matters',
    effect: PolicyEffect.ALLOW,
    priority: 203,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('attorney') &&
      (ctx.resource.type === 'transaction' ||
        ctx.resource.type === 'trust_account' ||
        ctx.resource.type === 'trust_transaction') &&
      ctx.action === 'read' &&
      ctx.resource.assignedTo?.includes(ctx.subject.id) === true,
  },

  // =====================================================
  // PARALEGAL / STAFF POLICIES (Priority 300-399)
  // =====================================================

  {
    name: 'allow-paralegal-matter-read',
    description: 'Paralegals can read matters assigned to them',
    effect: PolicyEffect.ALLOW,
    priority: 300,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('paralegal') &&
      ctx.resource.type === 'matter' &&
      (ctx.action === 'read' || ctx.action === 'list') &&
      ctx.resource.assignedTo?.includes(ctx.subject.id) === true,
  },

  {
    name: 'allow-paralegal-document-management',
    description: 'Paralegals can create and manage documents on assigned matters',
    effect: PolicyEffect.ALLOW,
    priority: 301,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('paralegal') &&
      (ctx.resource.type === 'document' || ctx.resource.type === 'document_template') &&
      (ctx.action === 'create' || ctx.action === 'read' || ctx.action === 'update' || ctx.action === 'list') &&
      ctx.resource.assignedTo?.includes(ctx.subject.id) === true,
  },

  {
    name: 'allow-paralegal-task-management',
    description: 'Paralegals can manage tasks assigned to them',
    effect: PolicyEffect.ALLOW,
    priority: 302,
    condition: (ctx: PolicyContext) =>
      ctx.subject.roles.includes('paralegal') &&
      ctx.resource.type === 'task' &&
      ctx.resource.assignedTo?.includes(ctx.subject.id) === true,
  },

  {
    name: 'allow-staff-time-entries',
    description: 'All staff can manage their own time entries',
    effect: PolicyEffect.ALLOW,
    priority: 303,
    condition: (ctx: PolicyContext) =>
      (ctx.subject.roles.includes('paralegal') || ctx.subject.roles.includes('staff')) &&
      ctx.resource.type === 'time_entry' &&
      ctx.resource.ownerId === ctx.subject.id,
  },

  // =====================================================
  // READ-ONLY POLICIES (Priority 400-499)
  // =====================================================

  {
    name: 'allow-all-read-templates',
    description: 'All authenticated users can read document templates',
    effect: PolicyEffect.ALLOW,
    priority: 400,
    condition: (ctx: PolicyContext) =>
      ctx.resource.type === 'document_template' &&
      ctx.action === 'read' &&
      ctx.subject.organizationId === ctx.resource.organizationId,
  },

  {
    name: 'allow-all-read-audit-logs',
    description: 'All authenticated users can read audit logs (read-only)',
    effect: PolicyEffect.ALLOW,
    priority: 401,
    condition: (ctx: PolicyContext) =>
      ctx.resource.type === 'audit_log' &&
      ctx.action === 'read' &&
      ctx.subject.organizationId === ctx.resource.organizationId,
  },

  {
    name: 'allow-own-profile-read',
    description: 'Users can read their own profile',
    effect: PolicyEffect.ALLOW,
    priority: 402,
    condition: (ctx: PolicyContext) =>
      ctx.resource.type === 'user' &&
      ctx.action === 'read' &&
      ctx.resource.id === ctx.subject.id,
  },
];
