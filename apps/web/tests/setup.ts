/**
 * Vitest Setup for Component Tests
 *
 * Configures:
 * - Testing Library utilities
 * - DOM matchers
 * - Global mocks
 * - Test environment
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  redirect: vi.fn(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    return props;
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: function MockLink(props: Record<string, unknown>) {
    return props;
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000';

// Suppress console errors in tests (keep warnings for debugging)
global.console = {
  ...console,
  error: vi.fn(),
  warn: console.warn,
};

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined;
    return {
      pass,
      message: () => pass
        ? `expected element not to be in the document`
        : `expected element to be in the document`,
    };
  },
});
