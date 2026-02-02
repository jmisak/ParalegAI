/**
 * CSRF Protection Configuration
 * OWASP Reference: A01:2021 - Broken Access Control
 *
 * Implements double-submit cookie pattern with signed tokens.
 * Uses HMAC-SHA256 for token generation and validation.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';

/**
 * CSRF token configuration
 */
export interface CsrfConfig {
  /** Cookie name for CSRF token */
  cookieName: string;
  /** Header name for CSRF token */
  headerName: string;
  /** Token validity in seconds */
  tokenTtlSec: number;
  /** Cookie options */
  cookie: CsrfCookieOptions;
  /** Methods that require CSRF validation */
  protectedMethods: string[];
  /** Paths exempt from CSRF (use sparingly) */
  ignorePaths: string[];
}

export interface CsrfCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  domain?: string;
  maxAge: number;
}

/**
 * Production CSRF configuration
 */
export const csrfConfig: CsrfConfig = {
  cookieName: '__Host-csrf',
  headerName: 'X-CSRF-Token',
  tokenTtlSec: 3600, // 1 hour
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 3600 * 1000, // 1 hour in ms
  },
  protectedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  ignorePaths: [
    '/api/webhooks/', // Webhooks use signature verification
    '/api/health',    // Health checks
  ],
};

/**
 * Development CSRF configuration
 */
export const csrfConfigDevelopment: CsrfConfig = {
  ...csrfConfig,
  cookieName: 'csrf',
  cookie: {
    ...csrfConfig.cookie,
    secure: false,
    sameSite: 'lax',
  },
};

/**
 * CSRF Token structure
 */
interface CsrfTokenPayload {
  /** Random nonce */
  nonce: string;
  /** User session ID */
  sessionId: string;
  /** Creation timestamp */
  timestamp: number;
  /** Token version for rotation */
  version: number;
}

/**
 * Generate CSRF token
 * SECURITY: Uses cryptographically secure random bytes
 */
export function generateCsrfToken(
  secret: string,
  sessionId: string,
): string {
  const payload: CsrfTokenPayload = {
    nonce: randomBytes(16).toString('hex'),
    sessionId,
    timestamp: Date.now(),
    version: 1,
  };

  const data = JSON.stringify(payload);
  const signature = createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  // Token format: base64(payload).signature
  const encodedPayload = Buffer.from(data).toString('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Validate CSRF token
 * SECURITY: Uses timing-safe comparison to prevent timing attacks
 * SECURITY: Explicitly rejects empty strings (LG-4 fix)
 */
export function validateCsrfToken(
  token: string,
  secret: string,
  sessionId: string,
  maxAgeSec: number = csrfConfig.tokenTtlSec,
): { valid: boolean; error?: string } {
  // SECURITY: Explicit empty string checks to prevent bypass (LG-4)
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return { valid: false, error: 'Missing CSRF token' };
  }

  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
    return { valid: false, error: 'Missing session ID' };
  }

  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    return { valid: false, error: 'Missing CSRF secret' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid token format' };
  }

  const [encodedPayload, providedSignature] = parts;

  // Decode and parse payload
  let payload: CsrfTokenPayload;
  try {
    const data = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    payload = JSON.parse(data);
  } catch {
    return { valid: false, error: 'Invalid token encoding' };
  }

  // Verify signature using timing-safe comparison
  const expectedSignature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  const providedBuffer = Buffer.from(providedSignature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (providedBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: 'Invalid signature' };
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return { valid: false, error: 'Invalid signature' };
  }

  // Verify session ID matches
  if (payload.sessionId !== sessionId) {
    return { valid: false, error: 'Session mismatch' };
  }

  // Verify token is not expired
  const age = (Date.now() - payload.timestamp) / 1000;
  if (age > maxAgeSec) {
    return { valid: false, error: 'Token expired' };
  }

  // Verify token is not from the future (clock skew tolerance: 5 min)
  if (payload.timestamp > Date.now() + 300000) {
    return { valid: false, error: 'Invalid timestamp' };
  }

  return { valid: true };
}

/**
 * Set CSRF cookie on response
 */
export function setCsrfCookie(
  res: Response,
  token: string,
  config: CsrfConfig = csrfConfig,
): void {
  res.cookie(config.cookieName, token, config.cookie);
}

/**
 * Extract CSRF token from request
 * Checks header first, then body, then query (for special cases)
 */
export function extractCsrfToken(
  req: Request,
  config: CsrfConfig = csrfConfig,
): string | undefined {
  // Primary: Check header
  const headerToken = req.headers[config.headerName.toLowerCase()];
  if (headerToken) {
    return Array.isArray(headerToken) ? headerToken[0] : headerToken;
  }

  // Secondary: Check body (for form submissions)
  if (req.body && typeof req.body === 'object') {
    const bodyToken = req.body._csrf || req.body.csrf_token;
    if (bodyToken && typeof bodyToken === 'string') {
      return bodyToken;
    }
  }

  return undefined;
}

/**
 * Check if request path is exempt from CSRF
 */
export function isPathExempt(
  path: string,
  config: CsrfConfig = csrfConfig,
): boolean {
  return config.ignorePaths.some((exempt) => path.startsWith(exempt));
}

/**
 * Check if request method requires CSRF validation
 */
export function isProtectedMethod(
  method: string,
  config: CsrfConfig = csrfConfig,
): boolean {
  return config.protectedMethods.includes(method.toUpperCase());
}

/**
 * CSRF validation error response
 */
export const csrfErrorResponse = {
  statusCode: 403,
  error: 'Forbidden',
  message: 'CSRF validation failed',
  code: 'CSRF_INVALID',
};

export default csrfConfig;
