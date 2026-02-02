/**
 * Shared Test Utilities
 *
 * Common testing utilities used across all packages:
 * - Custom render functions
 * - Test data generators
 * - Assertion helpers
 */

/**
 * Generates a random ID for testing
 */
export const generateTestId = (prefix = 'test'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

/**
 * Sleep utility for async tests
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Wait for condition to be true with timeout
 */
export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await sleep(interval);
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
};

/**
 * Generate random email for testing
 */
export const generateTestEmail = (domain = 'test.com'): string => {
  const random = Math.random().toString(36).substring(7);
  return `test.${random}@${domain}`;
};

/**
 * Generate random phone number
 */
export const generateTestPhone = (): string => {
  const area = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `${area}-${prefix}-${line}`;
};

/**
 * Generate random address
 */
export const generateTestAddress = (): string => {
  const streetNumber = Math.floor(Math.random() * 9000) + 1000;
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Ln'];
  const cities = ['Springfield', 'Shelbyville', 'Capital City', 'Ogdenville'];
  const states = ['IL', 'CA', 'NY', 'TX', 'FL'];

  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zip = Math.floor(Math.random() * 90000) + 10000;

  return `${streetNumber} ${street}, ${city}, ${state} ${zip}`;
};

/**
 * Deep clone utility for test data
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Compare objects ignoring specific fields
 */
export const compareObjectsIgnoring = (
  obj1: any,
  obj2: any,
  ignoreFields: string[]
): boolean => {
  const clean = (obj: any) => {
    const cleaned = { ...obj };
    ignoreFields.forEach((field) => delete cleaned[field]);
    return cleaned;
  };

  return JSON.stringify(clean(obj1)) === JSON.stringify(clean(obj2));
};

/**
 * Mock timer utilities
 */
export class MockTimer {
  private timers: NodeJS.Timeout[] = [];

  setTimeout(callback: () => void, ms: number): NodeJS.Timeout {
    const timer = setTimeout(callback, ms);
    this.timers.push(timer);
    return timer;
  }

  setInterval(callback: () => void, ms: number): NodeJS.Timeout {
    const timer = setInterval(callback, ms);
    this.timers.push(timer);
    return timer;
  }

  clearAll(): void {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.timers = [];
  }
}

/**
 * Custom matchers for common assertions
 */
export const customMatchers = {
  toBeWithinRange(received: number, floor: number, ceiling: number): boolean {
    return received >= floor && received <= ceiling;
  },

  toContainObject(received: any[], expected: any): boolean {
    return received.some((item) => JSON.stringify(item) === JSON.stringify(expected));
  },

  toBeValidDate(received: any): boolean {
    const date = new Date(received);
    return date instanceof Date && !isNaN(date.getTime());
  },

  toBeValidEmail(received: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(received);
  },
};
