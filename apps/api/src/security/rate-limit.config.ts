/**
 * Rate Limiting Configuration
 * OWASP Reference: A04:2021 - Insecure Design
 *
 * Implements multi-tier rate limiting:
 * - Per-IP limits (DDoS protection)
 * - Per-user limits (abuse prevention)
 * - Per-endpoint limits (resource protection)
 */

import type { Request } from 'express';

/**
 * Rate limit tier definitions
 */
export interface RateLimitTier {
  /** Time window in seconds */
  windowSec: number;
  /** Maximum requests per window */
  maxRequests: number;
  /** Block duration when limit exceeded (seconds) */
  blockDurationSec: number;
  /** Skip successful requests (for login endpoints) */
  skipSuccessfulRequests?: boolean;
  /** Skip failed requests */
  skipFailedRequests?: boolean;
}

/**
 * Rate limit configuration by category
 */
export const rateLimitTiers: Record<string, RateLimitTier> = {
  /**
   * Global per-IP limit
   * SECURITY: First line of defense against DDoS
   */
  global: {
    windowSec: 60,
    maxRequests: 100,
    blockDurationSec: 300, // 5 minute block
  },

  /**
   * Authentication endpoints
   * SECURITY: Strict limits to prevent credential stuffing
   */
  auth: {
    windowSec: 900, // 15 minutes
    maxRequests: 5,
    blockDurationSec: 3600, // 1 hour block
    skipSuccessfulRequests: true, // Only count failures
  },

  /**
   * Password reset
   * SECURITY: Very strict to prevent enumeration
   */
  passwordReset: {
    windowSec: 3600, // 1 hour
    maxRequests: 3,
    blockDurationSec: 7200, // 2 hour block
  },

  /**
   * MFA verification
   * SECURITY: Prevent brute force on TOTP codes
   */
  mfa: {
    windowSec: 300, // 5 minutes
    maxRequests: 5,
    blockDurationSec: 1800, // 30 minute block
  },

  /**
   * API endpoints (authenticated users)
   * SECURITY: Per-user limits after authentication
   */
  api: {
    windowSec: 60,
    maxRequests: 60, // 1 request per second average
    blockDurationSec: 60,
  },

  /**
   * Document upload
   * SECURITY: Resource-intensive operation
   */
  upload: {
    windowSec: 3600, // 1 hour
    maxRequests: 50,
    blockDurationSec: 3600,
  },

  /**
   * AI/LLM endpoints
   * SECURITY: Expensive operations, strict limits
   */
  ai: {
    windowSec: 60,
    maxRequests: 10,
    blockDurationSec: 120,
  },

  /**
   * Search endpoints
   * SECURITY: Prevent enumeration and resource exhaustion
   */
  search: {
    windowSec: 60,
    maxRequests: 30,
    blockDurationSec: 60,
  },

  /**
   * Bulk operations
   * SECURITY: Resource-intensive, strict limits
   */
  bulk: {
    windowSec: 3600,
    maxRequests: 10,
    blockDurationSec: 3600,
  },

  /**
   * Export operations
   * SECURITY: Data exfiltration prevention
   */
  export: {
    windowSec: 3600,
    maxRequests: 5,
    blockDurationSec: 3600,
  },
};

/**
 * Endpoint-specific rate limit mappings
 */
export const endpointRateLimits: Record<string, string> = {
  // Authentication
  'POST /auth/login': 'auth',
  'POST /auth/register': 'auth',
  'POST /auth/forgot-password': 'passwordReset',
  'POST /auth/reset-password': 'passwordReset',
  'POST /auth/verify-mfa': 'mfa',
  'POST /auth/setup-mfa': 'mfa',

  // AI operations
  'POST /ai/*': 'ai',
  'POST /documents/*/analyze': 'ai',
  'POST /contracts/*/review': 'ai',

  // File operations
  'POST /documents/upload': 'upload',
  'POST /documents/bulk-upload': 'bulk',

  // Search
  'GET /search': 'search',
  'POST /search': 'search',

  // Export
  'POST /export/*': 'export',
  'GET /reports/*/download': 'export',
};

/**
 * Extract rate limit key from request
 * SECURITY: Use user ID when authenticated, IP otherwise
 */
export function getRateLimitKey(req: Request): string {
  // Authenticated user - use user ID
  const userId = (req as any).user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  // Unauthenticated - use IP
  const ip = getClientIp(req);
  return `ip:${ip}`;
}

/**
 * Trusted proxy IP ranges (CIDR notation supported)
 * SECURITY: Only IPs in this list can set X-Forwarded-For (LG-5 fix)
 */
export const trustedProxyIps: string[] = [
  '127.0.0.1',
  '::1',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  // Add your load balancer/reverse proxy IPs here
];

/**
 * Check if an IP is within a CIDR range
 */
function ipInCidr(ip: string, cidr: string): boolean {
  // Handle exact match
  if (!cidr.includes('/')) {
    return ip === cidr;
  }

  const [range, bits] = cidr.split('/');
  const mask = parseInt(bits, 10);

  // Simple IPv4 check
  const ipParts = ip.split('.').map(Number);
  const rangeParts = range.split('.').map(Number);

  if (ipParts.length !== 4 || rangeParts.length !== 4) {
    return false;
  }

  const ipNum =
    (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const rangeNum =
    (rangeParts[0] << 24) |
    (rangeParts[1] << 16) |
    (rangeParts[2] << 8) |
    rangeParts[3];
  const maskNum = ~((1 << (32 - mask)) - 1);

  return (ipNum & maskNum) === (rangeNum & maskNum);
}

/**
 * Check if the request comes from a trusted proxy
 */
function isFromTrustedProxy(req: Request): boolean {
  const remoteIp = req.socket?.remoteAddress || '';

  // Normalize IPv6-mapped IPv4 addresses
  const normalizedIp = remoteIp.replace(/^::ffff:/, '');

  return trustedProxyIps.some((trusted) => ipInCidr(normalizedIp, trusted));
}

/**
 * Validate IP address format
 */
function isValidIp(ip: string): boolean {
  // Basic IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // Basic IPv6 validation
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every((p) => p >= 0 && p <= 255);
  }

  return ipv6Regex.test(ip);
}

/**
 * Extract client IP from request
 * SECURITY: Handle proxy headers securely (LG-5 fix)
 * Only trusts X-Forwarded-For from known trusted proxies
 */
export function getClientIp(req: Request): string {
  const remoteIp = req.socket?.remoteAddress || 'unknown';
  const normalizedRemoteIp = remoteIp.replace(/^::ffff:/, '');

  // Only trust proxy headers if TRUST_PROXY is enabled AND request comes from trusted proxy
  const trustProxy = process.env.TRUST_PROXY === 'true';

  if (trustProxy && isFromTrustedProxy(req)) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // Take the first IP (original client) and validate it
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      const clientIp = ips.trim();

      // Validate the IP format to prevent injection
      if (isValidIp(clientIp)) {
        return clientIp;
      }
      // Invalid IP in header, fall through to socket address
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      const ip = Array.isArray(realIp) ? realIp[0] : realIp;
      if (isValidIp(ip)) {
        return ip;
      }
    }
  }

  // Fallback to socket address
  return normalizedRemoteIp;
}

/**
 * Rate limit response headers
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

/**
 * Generate rate limit response headers
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetTime: Date,
  blocked: boolean = false,
): RateLimitHeaders {
  const headers: RateLimitHeaders = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(Math.ceil(resetTime.getTime() / 1000)),
  };

  if (blocked) {
    const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    headers['Retry-After'] = String(Math.max(1, retryAfter));
  }

  return headers;
}

/**
 * Rate limit exceeded response
 */
export const rateLimitExceededResponse = {
  statusCode: 429,
  error: 'Too Many Requests',
  message: 'Rate limit exceeded. Please try again later.',
};

/**
 * Redis key patterns for rate limiting
 */
export const rateLimitKeyPatterns = {
  counter: (key: string, tier: string) => `ratelimit:${tier}:${key}:count`,
  blocked: (key: string, tier: string) => `ratelimit:${tier}:${key}:blocked`,
  window: (key: string, tier: string) => `ratelimit:${tier}:${key}:window`,
};

/**
 * IP allowlist for internal services
 * SECURITY: Only trusted internal IPs
 */
export const rateLimitAllowlist: string[] = [
  '127.0.0.1',
  '::1',
  // Add internal service IPs as needed
];

/**
 * Check if IP is allowlisted
 */
export function isAllowlisted(ip: string): boolean {
  return rateLimitAllowlist.includes(ip);
}

export default rateLimitTiers;
