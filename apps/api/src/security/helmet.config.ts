/**
 * Helmet Security Configuration
 * OWASP Reference: A05:2021 - Security Misconfiguration
 *
 * Configures HTTP security headers for defense-in-depth.
 * All headers comply with OWASP Secure Headers Project recommendations.
 */

import helmet from 'helmet';
import type { HelmetOptions } from 'helmet';

/**
 * Content Security Policy directives
 * Strict policy with no unsafe-inline or unsafe-eval
 */
const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    childSrc: ["'none'"],
    workerSrc: ["'self'"],
    connectSrc: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    manifestSrc: ["'self'"],
    upgradeInsecureRequests: [],
    blockAllMixedContent: [],
  },
  reportOnly: false,
};

/**
 * Production Helmet configuration
 * Maximum security headers enabled
 */
export const helmetConfig: HelmetOptions = {
  // Content Security Policy - prevents XSS, data injection
  contentSecurityPolicy,

  // Cross-Origin-Embedder-Policy - requires CORP/CORS for cross-origin resources
  crossOriginEmbedderPolicy: { policy: 'require-corp' },

  // Cross-Origin-Opener-Policy - isolates browsing context
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin-Resource-Policy - prevents cross-origin resource sharing
  crossOriginResourcePolicy: { policy: 'same-origin' },

  // DNS Prefetch Control - disable for privacy
  dnsPrefetchControl: { allow: false },

  // Frameguard - prevent clickjacking
  frameguard: { action: 'deny' },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open - prevent IE from executing downloads in site context
  ieNoOpen: true,

  // No Sniff - prevent MIME type sniffing
  noSniff: true,

  // Origin Agent Cluster - request process isolation
  originAgentCluster: true,

  // Permitted Cross-Domain Policies - restrict Adobe Flash/PDF
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },

  // Referrer Policy - limit referrer information
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // X-XSS-Protection - legacy XSS filter (disabled as CSP is better)
  xssFilter: false,
};

/**
 * Development Helmet configuration
 * Relaxed CSP for hot-reload and debugging
 */
export const helmetConfigDevelopment: HelmetOptions = {
  ...helmetConfig,
  contentSecurityPolicy: {
    directives: {
      ...contentSecurityPolicy.directives,
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for HMR
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for styled-jsx
      connectSrc: ["'self'", 'ws:', 'wss:'], // WebSocket for HMR
    },
    reportOnly: true,
  },
  // Disable HSTS in development
  hsts: false,
};

/**
 * Creates Helmet middleware with environment-appropriate configuration
 */
export function createHelmetMiddleware(isDevelopment: boolean = false) {
  const config = isDevelopment ? helmetConfigDevelopment : helmetConfig;
  return helmet(config);
}

/**
 * Additional security headers not covered by Helmet
 * Apply via custom middleware
 */
export const additionalSecurityHeaders = {
  // Cache-Control for sensitive responses
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',

  // Permissions Policy (formerly Feature-Policy)
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
    'interest-cohort=()', // Disable FLoC
  ].join(', '),

  // Prevent caching of authenticated responses
  'Surrogate-Control': 'no-store',
};

export default helmetConfig;
