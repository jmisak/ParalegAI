/**
 * Global Test Setup for Unit Tests
 *
 * This file runs before all unit tests to configure:
 * - Jest matchers and custom assertions
 * - Global mocks for external services
 * - Environment variables for testing
 * - Test utilities and helpers
 */

import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-tests-only';
process.env.SESSION_SECRET = 'test-session-secret-for-unit-tests-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/ironclad_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};

// Increase timeout for slower tests
jest.setTimeout(10000);

// Global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        sleep: (ms: number) => Promise<void>;
        generateId: () => string;
      };
    }
  }
}

global.testUtils = {
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  generateId: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
};

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
    };
  },

  toBeISODate(received: string | Date) {
    const date = new Date(received);
    const pass = date instanceof Date && !isNaN(date.getTime());

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid ISO date`
          : `expected ${received} to be a valid ISO date`,
    };
  },
});

// Extend Jest matchers type
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeISODate(): R;
    }
  }
}
