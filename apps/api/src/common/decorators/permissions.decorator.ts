import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Available system permissions (ABAC)
 */
export enum Permission {
  // Matter permissions
  MATTER_CREATE = 'matter:create',
  MATTER_READ = 'matter:read',
  MATTER_UPDATE = 'matter:update',
  MATTER_DELETE = 'matter:delete',
  MATTER_ASSIGN = 'matter:assign',

  // Document permissions
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_READ = 'document:read',
  DOCUMENT_UPDATE = 'document:update',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_DOWNLOAD = 'document:download',
  DOCUMENT_SHARE = 'document:share',

  // Template permissions
  TEMPLATE_CREATE = 'template:create',
  TEMPLATE_READ = 'template:read',
  TEMPLATE_UPDATE = 'template:update',
  TEMPLATE_DELETE = 'template:delete',

  // AI permissions
  AI_ANALYZE = 'ai:analyze',
  AI_GENERATE = 'ai:generate',
  AI_REVIEW = 'ai:review',

  // Workflow permissions
  WORKFLOW_CREATE = 'workflow:create',
  WORKFLOW_READ = 'workflow:read',
  WORKFLOW_UPDATE = 'workflow:update',
  WORKFLOW_DELETE = 'workflow:delete',
  WORKFLOW_EXECUTE = 'workflow:execute',

  // User management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Organization management
  ORG_SETTINGS = 'org:settings',
  ORG_BILLING = 'org:billing',
  ORG_INTEGRATIONS = 'org:integrations',

  // Audit
  AUDIT_READ = 'audit:read',
}

/**
 * Decorator to specify required permissions for an endpoint
 * @example
 * ```typescript
 * @Permissions(Permission.DOCUMENT_READ, Permission.DOCUMENT_DOWNLOAD)
 * @Get(':id/download')
 * downloadDocument() {}
 * ```
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
