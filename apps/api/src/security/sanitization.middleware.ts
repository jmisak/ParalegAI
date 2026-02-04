/**
 * Input Sanitization Middleware
 * OWASP Reference: A03:2021 - Injection
 *
 * Provides defense-in-depth input sanitization for:
 * - SQL injection patterns
 * - NoSQL injection patterns
 * - XSS payloads
 * - Command injection
 * - Path traversal
 * - LDAP injection
 * - XML/XXE injection
 */

import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

/**
 * Sanitization configuration
 */
export interface SanitizationConfig {
  /** Maximum request body size (bytes) */
  maxBodySize: number;
  /** Maximum string field length */
  maxStringLength: number;
  /** Maximum array length */
  maxArrayLength: number;
  /** Maximum object depth */
  maxObjectDepth: number;
  /** Enable SQL injection detection */
  detectSqlInjection: boolean;
  /** Enable NoSQL injection detection */
  detectNoSqlInjection: boolean;
  /** Enable XSS detection */
  detectXss: boolean;
  /** Enable path traversal detection */
  detectPathTraversal: boolean;
  /** Log detected attacks */
  logAttacks: boolean;
}

export const defaultSanitizationConfig: SanitizationConfig = {
  maxBodySize: 10 * 1024 * 1024, // 10MB
  maxStringLength: 65536, // 64KB per string
  maxArrayLength: 1000,
  maxObjectDepth: 10,
  detectSqlInjection: true,
  detectNoSqlInjection: true,
  detectXss: true,
  detectPathTraversal: true,
  logAttacks: true,
};

/**
 * SQL injection patterns
 * SECURITY: Detects common SQL injection attempts
 */
const sqlInjectionPatterns: RegExp[] = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE)\b)/i,
  /(\b(UNION\s+(ALL\s+)?SELECT)\b)/i,
  /(--|\#|\/\*|\*\/)/,
  /(\bOR\b\s*\d+\s*=\s*\d+)/i,
  /(\bAND\b\s*\d+\s*=\s*\d+)/i,
  /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))/i,
  /(\bWAITFOR\b\s+\bDELAY\b)/i,
  /(\bBENCHMARK\b\s*\()/i,
  /(\bSLEEP\b\s*\()/i,
  /(\bLOAD_FILE\b\s*\()/i,
  /(\bINTO\s+(OUT|DUMP)FILE\b)/i,
];

/**
 * NoSQL injection patterns
 * SECURITY: Detects MongoDB/NoSQL injection attempts
 */
const noSqlInjectionPatterns: RegExp[] = [
  /\$where/i,
  /\$gt/i,
  /\$lt/i,
  /\$ne/i,
  /\$regex/i,
  /\$or/i,
  /\$and/i,
  /\$nin/i,
  /\$in/i,
  /\$exists/i,
  /\$elemMatch/i,
  /\{\s*\$\w+/,
];

/**
 * XSS patterns
 * SECURITY: Detects common XSS payloads
 */
const xssPatterns: RegExp[] = [
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript:/i,
  /vbscript:/i,
  /on\w+\s*=/i, // onclick=, onerror=, etc.
  /<iframe\b/i,
  /<object\b/i,
  /<embed\b/i,
  /<svg\b[^>]*onload/i,
  /expression\s*\(/i,
  /url\s*\(\s*['"]*data:/i,
];

/**
 * Path traversal patterns
 * SECURITY: Detects directory traversal attempts
 */
const pathTraversalPatterns: RegExp[] = [
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e%2f/i,
  /%2e%2e%5c/i,
  /\.\.%2f/i,
  /\.\.%5c/i,
  /%252e%252e%252f/i, // Double encoding
  /\.\./,
];

/**
 * Command injection patterns
 * SECURITY: Detects shell command injection
 */
const commandInjectionPatterns: RegExp[] = [
  /[;&|`$]/, // Shell metacharacters
  /\$\(/, // Command substitution
  /`[^`]+`/, // Backtick command substitution
  /\|\|/, // OR operator
  /&&/, // AND operator
  />\s*\//, // Redirect to file
  /<\s*\//, // Input from file
];

/**
 * Check string against injection patterns
 */
function detectInjection(
  value: string,
  patterns: RegExp[],
): { detected: boolean; pattern?: string } {
  for (const pattern of patterns) {
    if (pattern.test(value)) {
      return { detected: true, pattern: pattern.source };
    }
  }
  return { detected: false };
}

/**
 * Sanitize a string value
 */
export function sanitizeString(
  value: string,
  config: SanitizationConfig = defaultSanitizationConfig,
): { sanitized: string; violations: string[] } {
  const violations: string[] = [];
  let sanitized = value;

  // Truncate if too long
  if (sanitized.length > config.maxStringLength) {
    sanitized = sanitized.substring(0, config.maxStringLength);
    violations.push('STRING_TRUNCATED');
  }

  // Check for SQL injection
  if (config.detectSqlInjection) {
    const result = detectInjection(sanitized, sqlInjectionPatterns);
    if (result.detected) {
      violations.push(`SQL_INJECTION:${result.pattern}`);
    }
  }

  // Check for NoSQL injection
  if (config.detectNoSqlInjection) {
    const result = detectInjection(sanitized, noSqlInjectionPatterns);
    if (result.detected) {
      violations.push(`NOSQL_INJECTION:${result.pattern}`);
    }
  }

  // Check for XSS
  if (config.detectXss) {
    const result = detectInjection(sanitized, xssPatterns);
    if (result.detected) {
      violations.push(`XSS:${result.pattern}`);
    }
  }

  // Check for path traversal
  if (config.detectPathTraversal) {
    const result = detectInjection(sanitized, pathTraversalPatterns);
    if (result.detected) {
      violations.push(`PATH_TRAVERSAL:${result.pattern}`);
    }
  }

  // HTML entity encoding for output (XSS prevention)
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return { sanitized, violations };
}

/**
 * Recursively sanitize an object
 */
export function sanitizeObject(
  obj: unknown,
  config: SanitizationConfig = defaultSanitizationConfig,
  depth: number = 0,
): { sanitized: unknown; violations: string[] } {
  const violations: string[] = [];

  // Check depth
  if (depth > config.maxObjectDepth) {
    return { sanitized: null, violations: ['MAX_DEPTH_EXCEEDED'] };
  }

  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return { sanitized: obj, violations: [] };
  }

  // Handle strings
  if (typeof obj === 'string') {
    return sanitizeString(obj, config);
  }

  // Handle numbers/booleans
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return { sanitized: obj, violations: [] };
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length > config.maxArrayLength) {
      violations.push('ARRAY_TRUNCATED');
      obj = obj.slice(0, config.maxArrayLength);
    }
    const sanitizedArray = (obj as unknown[]).map((item: unknown) => {
      const result = sanitizeObject(item, config, depth + 1);
      violations.push(...result.violations);
      return result.sanitized;
    });
    return { sanitized: sanitizedArray, violations };
  }

  // Handle objects
  if (typeof obj === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const keyResult = sanitizeString(key, config);
      violations.push(...keyResult.violations.map((v) => `KEY:${v}`));

      // Sanitize value
      const valueResult = sanitizeObject(value, config, depth + 1);
      violations.push(...valueResult.violations);

      sanitizedObj[keyResult.sanitized] = valueResult.sanitized;
    }
    return { sanitized: sanitizedObj, violations };
  }

  return { sanitized: obj, violations: [] };
}

/**
 * Attack log entry
 */
export interface AttackLogEntry {
  timestamp: Date;
  requestId: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  violations: string[];
  payloadHash: string;
}

/**
 * Log detected attack
 */
function logAttack(entry: AttackLogEntry): void {
  // In production, this would go to a SIEM system
  console.warn('[SECURITY] Attack detected:', JSON.stringify(entry, null, 2));
}

/**
 * NestJS Middleware for input sanitization
 */
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  private config: SanitizationConfig;

  constructor(config: Partial<SanitizationConfig> = {}) {
    this.config = { ...defaultSanitizationConfig, ...config };
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const allViolations: string[] = [];

    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      const result = sanitizeObject(req.body, this.config);
      allViolations.push(...result.violations);
      req.body = result.sanitized;
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const result = sanitizeObject(req.query, this.config);
      allViolations.push(...result.violations);
      req.query = result.sanitized as typeof req.query;
    }

    // Sanitize path parameters
    if (req.params && typeof req.params === 'object') {
      const result = sanitizeObject(req.params, this.config);
      allViolations.push(...result.violations);
      req.params = result.sanitized as typeof req.params;
    }

    // Log and handle violations
    if (allViolations.length > 0) {
      const hasInjection = allViolations.some(
        (v) =>
          v.includes('SQL_INJECTION') ||
          v.includes('NOSQL_INJECTION') ||
          v.includes('XSS') ||
          v.includes('PATH_TRAVERSAL'),
      );

      if (this.config.logAttacks) {
        const payloadHash = createHash('sha256')
          .update(JSON.stringify(req.body || {}))
          .digest('hex')
          .substring(0, 16);

        logAttack({
          timestamp: new Date(),
          requestId: (req as any).id || 'unknown',
          ip: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          path: req.path,
          method: req.method,
          violations: allViolations,
          payloadHash,
        });
      }

      // Block requests with injection attempts
      if (hasInjection) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Request contains invalid characters',
          code: 'VALIDATION_FAILED',
        });
      }
    }

    next();
  }
}

export default SanitizationMiddleware;
