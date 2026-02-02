/**
 * Formatter utility tests
 * @module utils/formatters.test
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDollars,
  formatWholeDollars,
  parseCurrencyToCents,
  formatPhone,
  formatPhoneInternational,
  formatDate,
  formatDateShort,
  formatRelativeTime,
  formatAddressSingleLine,
  formatAddressMultiLine,
  formatFullName,
  formatNameLegal,
  formatPercentage,
  formatFileSize,
  formatMatterNumber,
  formatAPN,
  truncate,
  formatSSNMasked,
  formatEIN,
} from './formatters';

describe('Currency Formatters', () => {
  describe('formatCurrency', () => {
    it('should format cents to currency', () => {
      expect(formatCurrency(123456)).toBe('$1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle different currencies', () => {
      expect(formatCurrency(100000, 'EUR', 'de-DE')).toContain('1.000,00');
    });
  });

  describe('formatDollars', () => {
    it('should format dollars', () => {
      expect(formatDollars(1234.56)).toBe('$1,234.56');
    });
  });

  describe('formatWholeDollars', () => {
    it('should format whole dollars without cents', () => {
      expect(formatWholeDollars(1234.56)).toBe('$1,235');
    });
  });

  describe('parseCurrencyToCents', () => {
    it('should parse currency string to cents', () => {
      expect(parseCurrencyToCents('$1,234.56')).toBe(123456);
    });

    it('should handle plain numbers', () => {
      expect(parseCurrencyToCents('1234.56')).toBe(123456);
    });

    it('should throw on invalid input', () => {
      expect(() => parseCurrencyToCents('not a number')).toThrow();
    });
  });
});

describe('Phone Formatters', () => {
  describe('formatPhone', () => {
    it('should format 10-digit phone', () => {
      expect(formatPhone('5551234567')).toBe('(555) 123-4567');
    });

    it('should format phone with country code', () => {
      expect(formatPhone('15551234567')).toBe('+1 (555) 123-4567');
    });

    it('should handle already formatted input', () => {
      expect(formatPhone('(555) 123-4567')).toBe('(555) 123-4567');
    });
  });

  describe('formatPhoneInternational', () => {
    it('should add country code', () => {
      expect(formatPhoneInternational('5551234567')).toBe('+15551234567');
    });

    it('should not duplicate country code', () => {
      expect(formatPhoneInternational('15551234567')).toBe('+15551234567');
    });
  });
});

describe('Date Formatters', () => {
  // Use explicit local date to avoid timezone issues
  const testDate = new Date(2024, 5, 15, 14, 30, 0); // June 15, 2024 2:30 PM local time

  describe('formatDate', () => {
    it('should format date with default options', () => {
      expect(formatDate(testDate)).toMatch(/June 15, 2024/);
    });

    it('should accept Date objects', () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      expect(formatDate(date)).toMatch(/June 15, 2024/);
    });
  });

  describe('formatDateShort', () => {
    it('should format date as MM/DD/YYYY', () => {
      expect(formatDateShort(testDate)).toBe('06/15/2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "just now" for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should return hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
    });

    it('should return days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
    });
  });
});

describe('Address Formatters', () => {
  const address = {
    street1: '123 Main St',
    street2: 'Suite 100',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'US',
  };

  describe('formatAddressSingleLine', () => {
    it('should format address on single line', () => {
      expect(formatAddressSingleLine(address)).toBe(
        '123 Main St, Suite 100, Anytown, CA 12345'
      );
    });

    it('should omit US country', () => {
      expect(formatAddressSingleLine(address)).not.toContain('US');
    });

    it('should include non-US country', () => {
      expect(formatAddressSingleLine({ ...address, country: 'CA' })).toContain('CA');
    });
  });

  describe('formatAddressMultiLine', () => {
    it('should format address on multiple lines', () => {
      const result = formatAddressMultiLine(address);
      expect(result).toContain('\n');
      expect(result.split('\n')).toHaveLength(3);
    });
  });
});

describe('Name Formatters', () => {
  const name = {
    firstName: 'John',
    middleName: 'William',
    lastName: 'Doe',
    suffix: 'Jr.',
  };

  describe('formatFullName', () => {
    it('should format full name', () => {
      expect(formatFullName(name)).toBe('John William Doe Jr.');
    });

    it('should handle missing middle name', () => {
      expect(formatFullName({ ...name, middleName: undefined })).toBe('John Doe Jr.');
    });
  });

  describe('formatNameLegal', () => {
    it('should format name in legal style', () => {
      expect(formatNameLegal(name)).toBe('Doe Jr., John William');
    });
  });
});

describe('Other Formatters', () => {
  describe('formatPercentage', () => {
    it('should format decimal to percentage', () => {
      expect(formatPercentage(0.0625)).toBe('6.25%');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format KB', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format MB', () => {
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });
  });

  describe('formatMatterNumber', () => {
    it('should format matter number', () => {
      expect(formatMatterNumber(2024, 'RE', 123)).toBe('2024-RE-00123');
    });
  });

  describe('formatAPN', () => {
    it('should format APN with default pattern', () => {
      expect(formatAPN('123456789')).toBe('123-456-789');
    });

    it('should handle custom patterns', () => {
      expect(formatAPN('12345678', '##-###-###')).toBe('12-345-678');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('This is a long string', 10)).toBe('This is...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });
  });

  describe('formatSSNMasked', () => {
    it('should mask SSN showing last 4', () => {
      expect(formatSSNMasked('123456789')).toBe('***-**-6789');
    });
  });

  describe('formatEIN', () => {
    it('should format EIN', () => {
      expect(formatEIN('123456789')).toBe('12-3456789');
    });
  });
});
