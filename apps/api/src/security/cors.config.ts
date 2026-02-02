/**
 * CORS Configuration
 * OWASP Reference: A01:2021 - Broken Access Control
 *
 * Implements strict CORS policy with origin validation,
 * credential handling, and preflight caching.
 */

import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Allowed origins by environment
 * SECURITY: Wildcard origins are explicitly forbidden in production
 */
const allowedOrigins: Record<string, string[]> = {
  development: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],
  staging: [
    'https://staging.ironclad.app',
    'https://staging-api.ironclad.app',
  ],
  production: [
    'https://ironclad.app',
    'https://www.ironclad.app',
    'https://app.ironclad.app',
  ],
};

/**
 * Validates origin against whitelist
 * SECURITY: Case-insensitive comparison, no regex patterns
 */
function validateOrigin(
  origin: string | undefined,
  environment: string,
): boolean {
  // No origin header (same-origin requests, non-browser clients)
  // SECURITY: Still require origin for credentialed requests
  if (!origin) {
    return false;
  }

  const normalizedOrigin = origin.toLowerCase().trim();
  const allowedList = allowedOrigins[environment] || [];

  // Exact match only - no pattern matching to prevent bypasses
  return allowedList.some(
    (allowed) => allowed.toLowerCase() === normalizedOrigin,
  );
}

/**
 * Production CORS configuration
 * SECURITY: Strict settings, no wildcards
 */
export function createCorsConfig(
  environment: string = 'production',
): CorsOptions {
  return {
    /**
     * Origin validation callback
     * SECURITY: Dynamic validation against whitelist
     */
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      // SECURITY: These are still subject to authentication
      if (!origin) {
        // In production, reject no-origin requests to API endpoints
        if (environment === 'production') {
          callback(null, false);
          return;
        }
        callback(null, true);
        return;
      }

      if (validateOrigin(origin, environment)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} not allowed`), false);
      }
    },

    /**
     * Allowed HTTP methods
     * SECURITY: Explicit whitelist, no wildcards
     */
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /**
     * Allowed request headers
     * SECURITY: Explicit whitelist
     */
    allowedHeaders: [
      'Accept',
      'Accept-Language',
      'Content-Type',
      'Content-Language',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Request-ID',
      'X-Correlation-ID',
      'X-Client-Version',
    ],

    /**
     * Exposed response headers
     * SECURITY: Minimal exposure
     */
    exposedHeaders: [
      'X-Request-ID',
      'X-Correlation-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
    ],

    /**
     * Credentials support
     * SECURITY: Required for cookie-based sessions
     * NOTE: Cannot use wildcard origin with credentials=true
     */
    credentials: true,

    /**
     * Preflight cache duration (seconds)
     * SECURITY: 1 hour max, reduces preflight requests
     */
    maxAge: 3600,

    /**
     * Success status for OPTIONS
     * SECURITY: 204 is standard, some legacy browsers need 200
     */
    optionsSuccessStatus: 204,

    /**
     * Preflight continue
     * SECURITY: Let NestJS handle preflight responses
     */
    preflightContinue: false,
  };
}

/**
 * CORS configuration for public API endpoints (if any)
 * SECURITY: Read-only, no credentials
 */
export const publicApiCorsConfig: CorsOptions = {
  origin: true, // Allow any origin for public endpoints
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Accept', 'Accept-Language', 'Content-Type'],
  exposedHeaders: ['X-Request-ID'],
  credentials: false,
  maxAge: 86400, // 24 hours for public endpoints
  optionsSuccessStatus: 204,
};

/**
 * CORS error messages
 */
export const corsErrorMessages = {
  ORIGIN_NOT_ALLOWED: 'CORS policy: Origin not in allowlist',
  INVALID_METHOD: 'CORS policy: HTTP method not allowed',
  INVALID_HEADERS: 'CORS policy: Request headers not allowed',
  CREDENTIALS_MISMATCH: 'CORS policy: Credentials not supported for this origin',
};

/**
 * Audit logging for CORS violations
 */
export interface CorsViolation {
  timestamp: Date;
  origin: string;
  method: string;
  path: string;
  userAgent: string;
  ip: string;
  reason: string;
}

export default createCorsConfig;
