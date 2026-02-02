/**
 * Security Module Exports
 * Central export point for all security configurations and middleware
 */

// HTTP Security Headers
export {
  helmetConfig,
  helmetConfigDevelopment,
  createHelmetMiddleware,
  additionalSecurityHeaders,
} from './helmet.config';

// CORS Configuration
export {
  createCorsConfig,
  publicApiCorsConfig,
  corsErrorMessages,
  type CorsViolation,
} from './cors.config';

// Rate Limiting
export {
  rateLimitTiers,
  endpointRateLimits,
  getRateLimitKey,
  getClientIp,
  getRateLimitHeaders,
  rateLimitExceededResponse,
  rateLimitKeyPatterns,
  rateLimitAllowlist,
  isAllowlisted,
  type RateLimitTier,
  type RateLimitHeaders,
} from './rate-limit.config';

// CSRF Protection
export {
  csrfConfig,
  csrfConfigDevelopment,
  generateCsrfToken,
  validateCsrfToken,
  setCsrfCookie,
  extractCsrfToken,
  isPathExempt,
  isProtectedMethod,
  csrfErrorResponse,
  type CsrfConfig,
  type CsrfCookieOptions,
} from './csrf.config';

// Input Sanitization
export {
  SanitizationMiddleware,
  sanitizeString,
  sanitizeObject,
  defaultSanitizationConfig,
  type SanitizationConfig,
  type AttackLogEntry,
} from './sanitization.middleware';
