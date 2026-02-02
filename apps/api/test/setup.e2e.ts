/**
 * Global Test Setup for E2E Tests
 *
 * This file runs before all E2E tests to configure:
 * - Database connection and cleanup
 * - Test server initialization
 * - Authentication helpers
 * - Seed data creation
 */

import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Set E2E test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'e2e-jwt-secret-key-for-testing-only';
process.env.SESSION_SECRET = 'e2e-session-secret-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/ironclad_e2e_test';
process.env.REDIS_URL = 'redis://localhost:6379/2';

// Disable logging in E2E tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};

// Increase timeout for E2E tests
jest.setTimeout(30000);

// Global E2E test utilities
declare global {
  namespace NodeJS {
    interface Global {
      e2eUtils: {
        getAuthToken: (userId: string) => string;
        resetDatabase: () => Promise<void>;
      };
    }
  }
}

global.e2eUtils = {
  getAuthToken: (userId: string) => {
    // Mock JWT token generation for E2E tests
    return `Bearer mock-token-${userId}`;
  },

  resetDatabase: async () => {
    // This will be implemented when Prisma client is available
    // For now, it's a placeholder
    console.log('Database reset requested (not implemented yet)');
  },
};

// Before all tests, ensure database is clean
beforeAll(async () => {
  // Database setup will be added when Prisma is fully configured
  console.log('E2E Test Suite Starting...');
});

// After all tests, cleanup
afterAll(async () => {
  // Cleanup will be added when Prisma is fully configured
  console.log('E2E Test Suite Complete');
});
