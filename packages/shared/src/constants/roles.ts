/**
 * User roles and permissions constants
 * @module constants/roles
 */

import { UserRole, Permission } from '../enums';

/**
 * Role definition with permissions
 */
export interface RoleDefinition {
  /** Role */
  role: UserRole;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Combined permission flags */
  permissions: number;
  /** Whether this is an internal role */
  isInternal: boolean;
  /** Whether this role can be assigned to new users */
  canAssign: boolean;
  /** Parent role (inherits permissions) */
  inheritsFrom?: UserRole | undefined;
}

/**
 * Calculate combined permissions from individual permissions
 */
const combinePermissions = (...perms: Permission[]): number =>
  perms.reduce((acc, perm) => acc | perm, 0);

/**
 * All matter permissions
 */
const ALL_MATTER_PERMISSIONS = combinePermissions(
  Permission.MATTER_VIEW,
  Permission.MATTER_CREATE,
  Permission.MATTER_EDIT,
  Permission.MATTER_DELETE
);

/**
 * All document permissions
 */
const ALL_DOCUMENT_PERMISSIONS = combinePermissions(
  Permission.DOCUMENT_VIEW,
  Permission.DOCUMENT_CREATE,
  Permission.DOCUMENT_EDIT,
  Permission.DOCUMENT_DELETE
);

/**
 * All party permissions
 */
const ALL_PARTY_PERMISSIONS = combinePermissions(
  Permission.PARTY_VIEW,
  Permission.PARTY_CREATE,
  Permission.PARTY_EDIT,
  Permission.PARTY_DELETE
);

/**
 * All task permissions
 */
const ALL_TASK_PERMISSIONS = combinePermissions(
  Permission.TASK_VIEW,
  Permission.TASK_CREATE,
  Permission.TASK_EDIT,
  Permission.TASK_DELETE
);

/**
 * All AI permissions
 */
const ALL_AI_PERMISSIONS = combinePermissions(
  Permission.AI_USE,
  Permission.AI_GENERATE_DOCS,
  Permission.AI_ANALYZE,
  Permission.AI_CONFIGURE
);

/**
 * All admin permissions
 */
const ALL_ADMIN_PERMISSIONS = combinePermissions(
  Permission.USER_MANAGE,
  Permission.ROLE_MANAGE,
  Permission.SYSTEM_CONFIG,
  Permission.AUDIT_VIEW
);

/**
 * All billing permissions
 */
const ALL_BILLING_PERMISSIONS = combinePermissions(
  Permission.BILLING_VIEW,
  Permission.BILLING_MANAGE,
  Permission.REPORT_VIEW,
  Permission.REPORT_EXPORT
);

/**
 * Role definitions
 */
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: combinePermissions(
      ALL_MATTER_PERMISSIONS,
      ALL_DOCUMENT_PERMISSIONS,
      ALL_PARTY_PERMISSIONS,
      ALL_TASK_PERMISSIONS,
      ALL_AI_PERMISSIONS,
      ALL_ADMIN_PERMISSIONS,
      ALL_BILLING_PERMISSIONS
    ),
    isInternal: true,
    canAssign: true,
  },
  [UserRole.ATTORNEY_SENIOR]: {
    role: UserRole.ATTORNEY_SENIOR,
    name: 'Senior Attorney',
    description: 'Senior attorney with full matter access and team management',
    permissions: combinePermissions(
      ALL_MATTER_PERMISSIONS,
      ALL_DOCUMENT_PERMISSIONS,
      ALL_PARTY_PERMISSIONS,
      ALL_TASK_PERMISSIONS,
      ALL_AI_PERMISSIONS,
      Permission.BILLING_VIEW,
      Permission.BILLING_MANAGE,
      Permission.REPORT_VIEW,
      Permission.REPORT_EXPORT
    ),
    isInternal: true,
    canAssign: true,
  },
  [UserRole.ATTORNEY_ASSOCIATE]: {
    role: UserRole.ATTORNEY_ASSOCIATE,
    name: 'Associate Attorney',
    description: 'Associate attorney with standard matter access',
    permissions: combinePermissions(
      Permission.MATTER_VIEW,
      Permission.MATTER_CREATE,
      Permission.MATTER_EDIT,
      ALL_DOCUMENT_PERMISSIONS,
      ALL_PARTY_PERMISSIONS,
      ALL_TASK_PERMISSIONS,
      Permission.AI_USE,
      Permission.AI_GENERATE_DOCS,
      Permission.AI_ANALYZE,
      Permission.BILLING_VIEW,
      Permission.REPORT_VIEW
    ),
    isInternal: true,
    canAssign: true,
    inheritsFrom: UserRole.ATTORNEY_SENIOR,
  },
  [UserRole.PARALEGAL]: {
    role: UserRole.PARALEGAL,
    name: 'Paralegal',
    description: 'Paralegal with document and task management',
    permissions: combinePermissions(
      Permission.MATTER_VIEW,
      Permission.MATTER_CREATE,
      Permission.MATTER_EDIT,
      ALL_DOCUMENT_PERMISSIONS,
      ALL_PARTY_PERMISSIONS,
      ALL_TASK_PERMISSIONS,
      Permission.AI_USE,
      Permission.AI_GENERATE_DOCS,
      Permission.AI_ANALYZE,
      Permission.BILLING_VIEW
    ),
    isInternal: true,
    canAssign: true,
  },
  [UserRole.LEGAL_ASSISTANT]: {
    role: UserRole.LEGAL_ASSISTANT,
    name: 'Legal Assistant',
    description: 'Legal assistant with limited access',
    permissions: combinePermissions(
      Permission.MATTER_VIEW,
      Permission.DOCUMENT_VIEW,
      Permission.DOCUMENT_CREATE,
      Permission.PARTY_VIEW,
      Permission.PARTY_CREATE,
      Permission.TASK_VIEW,
      Permission.TASK_CREATE,
      Permission.TASK_EDIT,
      Permission.AI_USE
    ),
    isInternal: true,
    canAssign: true,
  },
  [UserRole.CLOSING_COORDINATOR]: {
    role: UserRole.CLOSING_COORDINATOR,
    name: 'Closing Coordinator',
    description: 'Closing coordinator with closing-focused access',
    permissions: combinePermissions(
      Permission.MATTER_VIEW,
      Permission.MATTER_EDIT,
      ALL_DOCUMENT_PERMISSIONS,
      Permission.PARTY_VIEW,
      Permission.PARTY_CREATE,
      Permission.PARTY_EDIT,
      ALL_TASK_PERMISSIONS,
      Permission.AI_USE,
      Permission.BILLING_VIEW
    ),
    isInternal: true,
    canAssign: true,
  },
  [UserRole.TITLE_EXAMINER]: {
    role: UserRole.TITLE_EXAMINER,
    name: 'Title Examiner',
    description: 'Title examiner with title-focused access',
    permissions: combinePermissions(
      Permission.MATTER_VIEW,
      Permission.DOCUMENT_VIEW,
      Permission.DOCUMENT_CREATE,
      Permission.DOCUMENT_EDIT,
      Permission.PARTY_VIEW,
      Permission.TASK_VIEW,
      Permission.TASK_CREATE,
      Permission.TASK_EDIT,
      Permission.AI_USE,
      Permission.AI_ANALYZE
    ),
    isInternal: true,
    canAssign: true,
  },
  [UserRole.CLIENT]: {
    role: UserRole.CLIENT,
    name: 'Client',
    description: 'External client with limited view access',
    permissions: combinePermissions(
      Permission.MATTER_VIEW,
      Permission.DOCUMENT_VIEW,
      Permission.TASK_VIEW
    ),
    isInternal: false,
    canAssign: true,
  },
  [UserRole.EXTERNAL_PARTY]: {
    role: UserRole.EXTERNAL_PARTY,
    name: 'External Party',
    description: 'External party (agent, lender, etc.) with minimal access',
    permissions: combinePermissions(Permission.MATTER_VIEW, Permission.DOCUMENT_VIEW),
    isInternal: false,
    canAssign: true,
  },
  [UserRole.AUDITOR]: {
    role: UserRole.AUDITOR,
    name: 'Auditor',
    description: 'Read-only auditor access',
    permissions: combinePermissions(
      Permission.MATTER_VIEW,
      Permission.DOCUMENT_VIEW,
      Permission.PARTY_VIEW,
      Permission.TASK_VIEW,
      Permission.AUDIT_VIEW,
      Permission.BILLING_VIEW,
      Permission.REPORT_VIEW
    ),
    isInternal: true,
    canAssign: true,
  },
} as const;

/**
 * Permission metadata
 */
export interface PermissionInfo {
  /** Permission flag */
  permission: Permission;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Category */
  category: string;
}

/**
 * Permission information registry
 */
export const PERMISSION_INFO: Record<Permission, PermissionInfo> = {
  [Permission.MATTER_VIEW]: {
    permission: Permission.MATTER_VIEW,
    name: 'View Matters',
    description: 'View matter details and history',
    category: 'Matter',
  },
  [Permission.MATTER_CREATE]: {
    permission: Permission.MATTER_CREATE,
    name: 'Create Matters',
    description: 'Create new matters',
    category: 'Matter',
  },
  [Permission.MATTER_EDIT]: {
    permission: Permission.MATTER_EDIT,
    name: 'Edit Matters',
    description: 'Edit matter details',
    category: 'Matter',
  },
  [Permission.MATTER_DELETE]: {
    permission: Permission.MATTER_DELETE,
    name: 'Delete Matters',
    description: 'Delete or archive matters',
    category: 'Matter',
  },
  [Permission.DOCUMENT_VIEW]: {
    permission: Permission.DOCUMENT_VIEW,
    name: 'View Documents',
    description: 'View and download documents',
    category: 'Document',
  },
  [Permission.DOCUMENT_CREATE]: {
    permission: Permission.DOCUMENT_CREATE,
    name: 'Create Documents',
    description: 'Upload and create documents',
    category: 'Document',
  },
  [Permission.DOCUMENT_EDIT]: {
    permission: Permission.DOCUMENT_EDIT,
    name: 'Edit Documents',
    description: 'Edit document metadata and versions',
    category: 'Document',
  },
  [Permission.DOCUMENT_DELETE]: {
    permission: Permission.DOCUMENT_DELETE,
    name: 'Delete Documents',
    description: 'Delete documents',
    category: 'Document',
  },
  [Permission.PARTY_VIEW]: {
    permission: Permission.PARTY_VIEW,
    name: 'View Parties',
    description: 'View party/contact information',
    category: 'Party',
  },
  [Permission.PARTY_CREATE]: {
    permission: Permission.PARTY_CREATE,
    name: 'Create Parties',
    description: 'Add new parties/contacts',
    category: 'Party',
  },
  [Permission.PARTY_EDIT]: {
    permission: Permission.PARTY_EDIT,
    name: 'Edit Parties',
    description: 'Edit party information',
    category: 'Party',
  },
  [Permission.PARTY_DELETE]: {
    permission: Permission.PARTY_DELETE,
    name: 'Delete Parties',
    description: 'Delete parties',
    category: 'Party',
  },
  [Permission.TASK_VIEW]: {
    permission: Permission.TASK_VIEW,
    name: 'View Tasks',
    description: 'View tasks and deadlines',
    category: 'Task',
  },
  [Permission.TASK_CREATE]: {
    permission: Permission.TASK_CREATE,
    name: 'Create Tasks',
    description: 'Create new tasks',
    category: 'Task',
  },
  [Permission.TASK_EDIT]: {
    permission: Permission.TASK_EDIT,
    name: 'Edit Tasks',
    description: 'Edit and complete tasks',
    category: 'Task',
  },
  [Permission.TASK_DELETE]: {
    permission: Permission.TASK_DELETE,
    name: 'Delete Tasks',
    description: 'Delete tasks',
    category: 'Task',
  },
  [Permission.AI_USE]: {
    permission: Permission.AI_USE,
    name: 'Use AI Features',
    description: 'Use AI assistant and analysis',
    category: 'AI',
  },
  [Permission.AI_GENERATE_DOCS]: {
    permission: Permission.AI_GENERATE_DOCS,
    name: 'Generate Documents with AI',
    description: 'Generate documents using AI',
    category: 'AI',
  },
  [Permission.AI_ANALYZE]: {
    permission: Permission.AI_ANALYZE,
    name: 'AI Document Analysis',
    description: 'Run AI analysis on documents',
    category: 'AI',
  },
  [Permission.AI_CONFIGURE]: {
    permission: Permission.AI_CONFIGURE,
    name: 'Configure AI',
    description: 'Configure AI models and settings',
    category: 'AI',
  },
  [Permission.USER_MANAGE]: {
    permission: Permission.USER_MANAGE,
    name: 'Manage Users',
    description: 'Create and manage user accounts',
    category: 'Admin',
  },
  [Permission.ROLE_MANAGE]: {
    permission: Permission.ROLE_MANAGE,
    name: 'Manage Roles',
    description: 'Configure roles and permissions',
    category: 'Admin',
  },
  [Permission.SYSTEM_CONFIG]: {
    permission: Permission.SYSTEM_CONFIG,
    name: 'System Configuration',
    description: 'Configure system settings',
    category: 'Admin',
  },
  [Permission.AUDIT_VIEW]: {
    permission: Permission.AUDIT_VIEW,
    name: 'View Audit Logs',
    description: 'Access audit logs and history',
    category: 'Admin',
  },
  [Permission.BILLING_VIEW]: {
    permission: Permission.BILLING_VIEW,
    name: 'View Billing',
    description: 'View billing information',
    category: 'Billing',
  },
  [Permission.BILLING_MANAGE]: {
    permission: Permission.BILLING_MANAGE,
    name: 'Manage Billing',
    description: 'Manage invoices and payments',
    category: 'Billing',
  },
  [Permission.REPORT_VIEW]: {
    permission: Permission.REPORT_VIEW,
    name: 'View Reports',
    description: 'View reports and analytics',
    category: 'Billing',
  },
  [Permission.REPORT_EXPORT]: {
    permission: Permission.REPORT_EXPORT,
    name: 'Export Reports',
    description: 'Export reports and data',
    category: 'Billing',
  },
} as const;

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userPermissions: number, permission: Permission): boolean =>
  (userPermissions & permission) === permission;

/**
 * Check if a user has all specified permissions
 */
export const hasAllPermissions = (
  userPermissions: number,
  permissions: readonly Permission[]
): boolean => permissions.every((p) => hasPermission(userPermissions, p));

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (
  userPermissions: number,
  permissions: readonly Permission[]
): boolean => permissions.some((p) => hasPermission(userPermissions, p));

/**
 * Get role definition
 */
export const getRoleDefinition = (role: UserRole): RoleDefinition => ROLE_DEFINITIONS[role];

/**
 * Get all internal roles
 */
export const INTERNAL_ROLES = (Object.values(ROLE_DEFINITIONS) as RoleDefinition[])
  .filter((r) => r.isInternal)
  .map((r) => r.role);

/**
 * Get all external roles
 */
export const EXTERNAL_ROLES = (Object.values(ROLE_DEFINITIONS) as RoleDefinition[])
  .filter((r) => !r.isInternal)
  .map((r) => r.role);

/**
 * Get permissions by category
 */
export const getPermissionsByCategory = (category: string): readonly Permission[] =>
  (Object.values(PERMISSION_INFO) as PermissionInfo[])
    .filter((p) => p.category === category)
    .map((p) => p.permission);

/**
 * Get all permission categories
 */
export const PERMISSION_CATEGORIES = [
  ...new Set((Object.values(PERMISSION_INFO) as PermissionInfo[]).map((p) => p.category)),
] as const;
