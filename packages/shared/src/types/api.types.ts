/**
 * API types for IronClad
 * @module types/api
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data: T;
  /** Response metadata */
  meta?: ApiResponseMeta | undefined;
}

/**
 * API response metadata
 */
export interface ApiResponseMeta {
  /** Request ID for tracing */
  requestId: string;
  /** Response timestamp */
  timestamp: string;
  /** API version */
  apiVersion: string;
  /** Processing duration (ms) */
  durationMs?: number | undefined;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data items */
  data: readonly T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
  /** Response metadata */
  meta?: ApiResponseMeta | undefined;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number | undefined;
  /** Items per page */
  pageSize?: number | undefined;
  /** Sort field */
  sortBy?: string | undefined;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc' | undefined;
}

/**
 * Error response
 */
export interface ErrorResponse {
  /** Always false for errors */
  success: false;
  /** Error information */
  error: ApiError;
  /** Response metadata */
  meta?: ApiResponseMeta | undefined;
}

/**
 * API error details
 */
export interface ApiError {
  /** Error code */
  code: ApiErrorCode;
  /** Human-readable error message */
  message: string;
  /** Detailed error description */
  details?: string | undefined;
  /** Field-specific validation errors */
  validationErrors?: readonly ValidationError[] | undefined;
  /** Stack trace (development only) */
  stack?: string | undefined;
  /** Inner error (for chained errors) */
  innerError?: {
    code: string;
    message: string;
  } | undefined;
}

/**
 * Field validation error
 */
export interface ValidationError {
  /** Field name/path */
  field: string;
  /** Error message */
  message: string;
  /** Validation rule that failed */
  rule?: string | undefined;
  /** Invalid value (sanitized) */
  value?: unknown | undefined;
}

/**
 * Standard API error codes
 */
export type ApiErrorCode =
  // Authentication errors (1xxx)
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_INVALID'
  | 'AUTH_REFRESH_TOKEN_EXPIRED'
  | 'AUTH_MFA_REQUIRED'
  | 'AUTH_MFA_INVALID'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'AUTH_ACCOUNT_INACTIVE'
  | 'AUTH_SESSION_EXPIRED'
  // Authorization errors (2xxx)
  | 'AUTHZ_FORBIDDEN'
  | 'AUTHZ_INSUFFICIENT_PERMISSIONS'
  | 'AUTHZ_RESOURCE_ACCESS_DENIED'
  // Validation errors (3xxx)
  | 'VALIDATION_FAILED'
  | 'VALIDATION_REQUIRED_FIELD'
  | 'VALIDATION_INVALID_FORMAT'
  | 'VALIDATION_OUT_OF_RANGE'
  | 'VALIDATION_INVALID_ENUM'
  // Resource errors (4xxx)
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_ALREADY_EXISTS'
  | 'RESOURCE_CONFLICT'
  | 'RESOURCE_DELETED'
  | 'RESOURCE_LOCKED'
  // Business logic errors (5xxx)
  | 'BUSINESS_RULE_VIOLATION'
  | 'BUSINESS_STATE_INVALID'
  | 'BUSINESS_LIMIT_EXCEEDED'
  | 'BUSINESS_OPERATION_NOT_ALLOWED'
  // External service errors (6xxx)
  | 'EXTERNAL_SERVICE_ERROR'
  | 'EXTERNAL_SERVICE_TIMEOUT'
  | 'EXTERNAL_SERVICE_UNAVAILABLE'
  // Server errors (9xxx)
  | 'SERVER_INTERNAL_ERROR'
  | 'SERVER_DATABASE_ERROR'
  | 'SERVER_CACHE_ERROR'
  | 'SERVER_FILE_SYSTEM_ERROR'
  | 'SERVER_RATE_LIMIT_EXCEEDED'
  | 'SERVER_MAINTENANCE';

/**
 * Batch operation request
 */
export interface BatchRequest<T> {
  /** Operations to perform */
  operations: readonly BatchOperation<T>[];
  /** Whether to stop on first error */
  stopOnError?: boolean | undefined;
  /** Whether to run in transaction */
  transactional?: boolean | undefined;
}

/**
 * Batch operation
 */
export interface BatchOperation<T> {
  /** Operation ID (for result correlation) */
  id: string;
  /** Operation type */
  type: 'create' | 'update' | 'delete';
  /** Resource type */
  resource: string;
  /** Resource ID (for update/delete) */
  resourceId?: string | undefined;
  /** Operation data */
  data?: T | undefined;
}

/**
 * Batch operation response
 */
export interface BatchResponse<T> {
  /** Whether all operations succeeded */
  success: boolean;
  /** Individual operation results */
  results: readonly BatchOperationResult<T>[];
  /** Summary statistics */
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
  /** Response metadata */
  meta?: ApiResponseMeta | undefined;
}

/**
 * Individual batch operation result
 */
export interface BatchOperationResult<T> {
  /** Operation ID */
  id: string;
  /** Whether operation succeeded */
  success: boolean;
  /** Result data (if successful) */
  data?: T | undefined;
  /** Error (if failed) */
  error?: ApiError | undefined;
}

/**
 * Search request
 */
export interface SearchRequest {
  /** Search query */
  query: string;
  /** Resource types to search */
  resourceTypes?: readonly string[] | undefined;
  /** Filters */
  filters?: Record<string, unknown> | undefined;
  /** Pagination */
  pagination?: PaginationParams | undefined;
  /** Whether to use semantic search */
  semantic?: boolean | undefined;
  /** Highlight matching terms */
  highlight?: boolean | undefined;
}

/**
 * Search response
 */
export interface SearchResponse<T> {
  /** Search results */
  results: readonly SearchResult<T>[];
  /** Pagination */
  pagination: PaginationMeta;
  /** Facets/aggregations */
  facets?: Record<string, readonly FacetValue[]> | undefined;
  /** Query suggestions */
  suggestions?: readonly string[] | undefined;
  /** Response metadata */
  meta?: ApiResponseMeta | undefined;
}

/**
 * Individual search result
 */
export interface SearchResult<T> {
  /** Result data */
  data: T;
  /** Relevance score */
  score: number;
  /** Highlighted excerpts */
  highlights?: Record<string, readonly string[]> | undefined;
}

/**
 * Facet value for aggregations
 */
export interface FacetValue {
  /** Facet value */
  value: string;
  /** Count of items */
  count: number;
}

/**
 * Webhook event
 */
export interface WebhookEvent {
  /** Event ID */
  id: string;
  /** Event type */
  type: WebhookEventType;
  /** Resource type */
  resourceType: string;
  /** Resource ID */
  resourceId: string;
  /** Organization ID */
  organizationId: string;
  /** Event payload */
  payload: Record<string, unknown>;
  /** Event timestamp */
  timestamp: string;
  /** Delivery attempt number */
  attempt: number;
}

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'matter.created'
  | 'matter.updated'
  | 'matter.status_changed'
  | 'matter.closed'
  | 'document.created'
  | 'document.signed'
  | 'document.recorded'
  | 'task.created'
  | 'task.completed'
  | 'task.overdue'
  | 'deadline.approaching'
  | 'deadline.missed'
  | 'transaction.created'
  | 'transaction.status_changed'
  | 'transaction.closed'
  | 'party.created'
  | 'party.updated'
  | 'ai.processing_complete'
  | 'ai.processing_failed';

/**
 * File upload response
 */
export interface FileUploadResponse {
  /** Upload ID */
  uploadId: string;
  /** File ID (after processing) */
  fileId: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Upload URL (for resumable uploads) */
  uploadUrl?: string | undefined;
  /** Processing status */
  status: 'pending' | 'processing' | 'complete' | 'failed';
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Overall status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Component statuses */
  components: Record<string, ComponentHealth>;
  /** Response timestamp */
  timestamp: string;
  /** Version information */
  version: {
    api: string;
    build: string;
  };
}

/**
 * Component health status
 */
export interface ComponentHealth {
  /** Component status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Response time (ms) */
  responseTimeMs?: number | undefined;
  /** Error message (if unhealthy) */
  error?: string | undefined;
  /** Last check timestamp */
  lastChecked: string;
}
