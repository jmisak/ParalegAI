/**
 * Comprehensive Audit Logging Interceptor
 * OWASP Reference: A09:2021 - Security Logging and Monitoring Failures
 *
 * Implements:
 * - Request/response logging
 * - User action audit trails
 * - Sensitive data access logging
 * - Tamper-evident log format
 * - Log integrity verification
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { createHash, createHmac, randomBytes } from 'crypto';
import type { Request, Response } from 'express';

/**
 * Audit log severity levels
 */
export enum AuditSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Audit event categories
 */
export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  DATA_DELETION = 'DATA_DELETION',
  DATA_EXPORT = 'DATA_EXPORT',
  PRIVILEGED_ACCESS = 'PRIVILEGED_ACCESS',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  SECURITY_EVENT = 'SECURITY_EVENT',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  /** Unique log ID */
  id: string;
  /** Log timestamp (ISO 8601) */
  timestamp: string;
  /** Event severity */
  severity: AuditSeverity;
  /** Event category */
  category: AuditCategory;
  /** Event type/action */
  action: string;
  /** Outcome (success/failure) */
  outcome: 'success' | 'failure';
  /** User context */
  user: {
    id?: string;
    organizationId?: string;
    sessionId?: string;
    roles?: string[];
  };
  /** Request context */
  request: {
    id: string;
    method: string;
    path: string;
    query?: Record<string, unknown>;
    ip: string;
    userAgent: string;
    correlationId?: string;
  };
  /** Response context */
  response?: {
    statusCode: number;
    duration: number;
  };
  /** Resource being accessed */
  resource?: {
    type: string;
    id: string;
    organizationId?: string;
  };
  /** Additional context */
  context?: Record<string, unknown>;
  /** Error details (if failure) */
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  /** Previous log entry hash (chain) */
  previousHash?: string;
  /** Current entry hash */
  hash: string;
}

/**
 * Sensitive fields to redact
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'cookie',
  'ssn',
  'socialSecurityNumber',
  'social_security_number',
  'creditCard',
  'credit_card',
  'cvv',
  'pin',
  'dob',
  'dateOfBirth',
  'date_of_birth',
];

/**
 * Paths that should have enhanced logging
 */
const ENHANCED_LOGGING_PATHS = [
  '/auth',
  '/admin',
  '/users',
  '/documents',
  '/matters',
  '/ai',
  '/export',
];

/**
 * Paths to exclude from logging
 */
const EXCLUDED_PATHS = ['/health', '/metrics', '/favicon.ico'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');
  private lastLogHash: string = '';
  private logSecret: string;

  constructor() {
    // In production, this would come from secure configuration
    this.logSecret = process.env.AUDIT_LOG_SECRET || randomBytes(32).toString('hex');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip excluded paths
    if (this.isExcludedPath(request.path)) {
      return next.handle();
    }

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Attach request ID to response headers
    response.setHeader('X-Request-ID', requestId);

    // Determine audit category
    const category = this.determineCategory(request);
    const requiresEnhancedLogging = this.requiresEnhancedLogging(request.path);

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - startTime;
        const entry = this.createAuditEntry({
          requestId,
          request,
          response,
          category,
          outcome: 'success',
          duration,
          responseData: requiresEnhancedLogging ? responseData : undefined,
        });
        this.writeAuditLog(entry);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const entry = this.createAuditEntry({
          requestId,
          request,
          response,
          category,
          outcome: 'failure',
          duration,
          error,
        });
        this.writeAuditLog(entry);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Create audit log entry
   */
  private createAuditEntry(params: {
    requestId: string;
    request: Request;
    response: Response;
    category: AuditCategory;
    outcome: 'success' | 'failure';
    duration: number;
    responseData?: any;
    error?: any;
  }): AuditLogEntry {
    const { requestId, request, response, category, outcome, duration, error } = params;
    const user = (request as any).user;
    const timestamp = new Date().toISOString();

    const entry: Omit<AuditLogEntry, 'hash'> = {
      id: requestId,
      timestamp,
      severity: this.determineSeverity(outcome, error, category),
      category,
      action: `${request.method} ${this.normalizePath(request.path)}`,
      outcome,
      user: {
        id: user?.id || user?.userId,
        organizationId: user?.organizationId || user?.org,
        sessionId: user?.sessionId || user?.sid,
        roles: user?.roles,
      },
      request: {
        id: requestId,
        method: request.method,
        path: request.path,
        query: this.sanitizeObject(request.query),
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'unknown',
        correlationId: request.headers['x-correlation-id'] as string,
      },
      response: {
        statusCode: response.statusCode,
        duration,
      },
      previousHash: this.lastLogHash,
      hash: '', // Will be computed
    };

    // Add resource context if available
    const resourceId = request.params?.id || request.params?.documentId || request.params?.matterId;
    if (resourceId) {
      entry.resource = {
        type: this.inferResourceType(request.path),
        id: resourceId,
        organizationId: user?.organizationId,
      };
    }

    // Add error context if failure
    if (error) {
      entry.error = {
        code: error.code || error.name || 'UNKNOWN_ERROR',
        message: error.message || 'An error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }

    // Compute hash for tamper evidence
    const hash = this.computeEntryHash(entry);
    this.lastLogHash = hash;

    return { ...entry, hash };
  }

  /**
   * Write audit log entry
   */
  private writeAuditLog(entry: AuditLogEntry): void {
    // In production, this would:
    // 1. Write to append-only log storage
    // 2. Send to SIEM system
    // 3. Replicate to backup storage

    const logMethod =
      entry.severity === AuditSeverity.ERROR || entry.severity === AuditSeverity.CRITICAL
        ? 'error'
        : entry.severity === AuditSeverity.WARN
          ? 'warn'
          : 'log';

    this.logger[logMethod](JSON.stringify(entry));
  }

  /**
   * Determine audit category from request
   */
  private determineCategory(request: Request): AuditCategory {
    const path = request.path.toLowerCase();
    const method = request.method;

    if (path.includes('/auth')) {
      return AuditCategory.AUTHENTICATION;
    }

    if (path.includes('/admin') || path.includes('/config')) {
      return AuditCategory.CONFIGURATION_CHANGE;
    }

    if (path.includes('/export') || path.includes('/download')) {
      return AuditCategory.DATA_EXPORT;
    }

    if (path.includes('/privileged') || path.includes('/attorney')) {
      return AuditCategory.PRIVILEGED_ACCESS;
    }

    switch (method) {
      case 'POST':
        return AuditCategory.DATA_MODIFICATION;
      case 'PUT':
      case 'PATCH':
        return AuditCategory.DATA_MODIFICATION;
      case 'DELETE':
        return AuditCategory.DATA_DELETION;
      default:
        return AuditCategory.DATA_ACCESS;
    }
  }

  /**
   * Determine log severity
   */
  private determineSeverity(
    outcome: 'success' | 'failure',
    error: any,
    category: AuditCategory,
  ): AuditSeverity {
    if (outcome === 'failure') {
      if (error?.status >= 500 || error?.statusCode >= 500) {
        return AuditSeverity.ERROR;
      }
      if (category === AuditCategory.AUTHENTICATION) {
        return AuditSeverity.WARN;
      }
      return AuditSeverity.WARN;
    }

    if (category === AuditCategory.PRIVILEGED_ACCESS || category === AuditCategory.DATA_EXPORT) {
      return AuditSeverity.INFO;
    }

    if (category === AuditCategory.CONFIGURATION_CHANGE) {
      return AuditSeverity.WARN;
    }

    return AuditSeverity.INFO;
  }

  /**
   * Sanitize object to remove sensitive data
   */
  private sanitizeObject(obj: any): Record<string, unknown> | undefined {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Compute tamper-evident hash for log entry
   */
  private computeEntryHash(entry: Omit<AuditLogEntry, 'hash'>): string {
    const content = JSON.stringify(entry);
    return createHmac('sha256', this.logSecret).update(content).digest('hex');
  }

  /**
   * Verify log entry integrity
   */
  verifyLogIntegrity(entry: AuditLogEntry): boolean {
    const { hash, ...entryWithoutHash } = entry;
    const computedHash = this.computeEntryHash(entryWithoutHash);
    return hash === computedHash;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
  }

  /**
   * Get client IP from request
   */
  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim();
    }
    return request.ip || request.socket?.remoteAddress || 'unknown';
  }

  /**
   * Normalize path for logging (remove IDs for aggregation)
   */
  private normalizePath(path: string): string {
    return path.replace(/\/[a-f0-9-]{36}/gi, '/:id').replace(/\/\d+/g, '/:id');
  }

  /**
   * Infer resource type from path
   */
  private inferResourceType(path: string): string {
    const segments = path.split('/').filter(Boolean);
    // Return the resource type segment (usually first after /api)
    return segments.find((s) => !['api', 'v1', 'v2'].includes(s)) || 'unknown';
  }

  /**
   * Check if path requires enhanced logging
   */
  private requiresEnhancedLogging(path: string): boolean {
    return ENHANCED_LOGGING_PATHS.some((p) => path.startsWith(p));
  }

  /**
   * Check if path should be excluded from logging
   */
  private isExcludedPath(path: string): boolean {
    return EXCLUDED_PATHS.some((p) => path.startsWith(p));
  }
}

export default AuditInterceptor;
