import { Request } from 'express';

/**
 * Authenticated user payload from JWT
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

/**
 * Tenant context for multi-tenancy
 */
export interface TenantContext {
  organizationId: string;
  organizationName: string;
  subscriptionTier: 'free' | 'professional' | 'enterprise';
  features: string[];
}

/**
 * Extended Express Request with auth context
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  tenant: TenantContext;
}

/**
 * User entity for responses (excludes sensitive data)
 */
export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
