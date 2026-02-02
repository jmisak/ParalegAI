import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatFileSize,
  truncate,
  capitalize,
  titleCase,
  getInitials,
  slugify,
} from './utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});

describe('formatDate', () => {
  it('should format a date string', () => {
    const result = formatDate('2026-02-02');
    expect(result).toContain('Feb');
    expect(result).toContain('2');
    expect(result).toContain('2026');
  });

  it('should format a Date object', () => {
    const result = formatDate(new Date(2026, 0, 15));
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });

  it('should accept custom options', () => {
    const result = formatDate('2026-02-02', { weekday: 'long' });
    // Weekday varies based on timezone, just verify the option was applied
    expect(result).toMatch(/day/i);
  });
});

describe('formatRelativeTime', () => {
  it('should return "just now" for recent times', () => {
    const result = formatRelativeTime(new Date());
    expect(result).toBe('just now');
  });

  it('should format minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toBe('5 minutes ago');
  });

  it('should format hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoHoursAgo);
    expect(result).toBe('2 hours ago');
  });

  it('should format days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(threeDaysAgo);
    expect(result).toBe('3 days ago');
  });
});

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('should format whole numbers without decimals', () => {
    const result = formatCurrency(1000);
    expect(result).toBe('$1,000');
  });

  it('should handle large numbers', () => {
    const result = formatCurrency(1234567.89);
    expect(result).toBe('$1,234,567.89');
  });
});

describe('formatNumber', () => {
  it('should format numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should handle small numbers', () => {
    expect(formatNumber(42)).toBe('42');
  });
});

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should handle zero', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello, World!', 8)).toBe('Hello...');
  });

  it('should not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should handle exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should handle already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('should handle single character', () => {
    expect(capitalize('h')).toBe('H');
  });
});

describe('titleCase', () => {
  it('should convert to title case', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });

  it('should handle uppercase input', () => {
    expect(titleCase('HELLO WORLD')).toBe('Hello World');
  });
});

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should limit to maxLength', () => {
    expect(getInitials('John Middle Doe', 2)).toBe('JM');
  });

  it('should handle three names', () => {
    expect(getInitials('John Middle Doe', 3)).toBe('JMD');
  });
});

describe('slugify', () => {
  it('should create URL-safe slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });
});
