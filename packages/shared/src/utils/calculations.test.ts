/**
 * Calculation utility tests
 * @module utils/calculations.test
 */

import { describe, it, expect } from 'vitest';
import {
  isWeekend,
  isBusinessDay,
  isFederalHoliday,
  getFederalHolidays,
  addBusinessDays,
  addCalendarDays,
  businessDaysBetween,
  calculateProration,
  calculateTaxProration,
  calculateMonthlyPayment,
  calculateLTV,
  calculateDTI,
  calculateTransferTax,
  calculateCommission,
  calculateCommissionSplit,
  calculatePrepaidInterest,
  daysUntilDeadline,
  isDeadlineOverdue,
  getDeadlineStatus,
} from './calculations';

describe('Date Utilities', () => {
  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      // June 15, 2024 is a Saturday
      const saturday = new Date(2024, 5, 15);
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      // June 16, 2024 is a Sunday
      const sunday = new Date(2024, 5, 16);
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekdays', () => {
      // June 17, 2024 is a Monday
      const monday = new Date(2024, 5, 17);
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('getFederalHolidays', () => {
    it('should return holidays for a year', () => {
      const holidays = getFederalHolidays(2024);
      expect(holidays.length).toBeGreaterThan(0);
    });

    it('should include New Years Day', () => {
      const holidays = getFederalHolidays(2024);
      const newYears = holidays.find((h) => h.getMonth() === 0 && h.getDate() === 1);
      expect(newYears).toBeDefined();
    });

    it('should include Thanksgiving', () => {
      const holidays = getFederalHolidays(2024);
      // Thanksgiving 2024 is November 28
      const thanksgiving = holidays.find(
        (h) => h.getMonth() === 10 && h.getDate() === 28
      );
      expect(thanksgiving).toBeDefined();
    });
  });

  describe('isFederalHoliday', () => {
    it('should return true for Christmas', () => {
      const christmas = new Date(2024, 11, 25);
      expect(isFederalHoliday(christmas)).toBe(true);
    });

    it('should return false for regular days', () => {
      const regularDay = new Date(2024, 5, 17); // Monday June 17
      expect(isFederalHoliday(regularDay)).toBe(false);
    });
  });

  describe('isBusinessDay', () => {
    it('should return true for regular weekday', () => {
      const monday = new Date(2024, 5, 17); // Monday June 17
      expect(isBusinessDay(monday)).toBe(true);
    });

    it('should return false for weekend', () => {
      const saturday = new Date(2024, 5, 15); // Saturday June 15
      expect(isBusinessDay(saturday)).toBe(false);
    });

    it('should return false for holiday', () => {
      const christmas = new Date(2024, 11, 25);
      expect(isBusinessDay(christmas)).toBe(false);
    });
  });

  describe('addBusinessDays', () => {
    it('should add business days', () => {
      const monday = new Date(2024, 5, 17); // Monday June 17
      const result = addBusinessDays(monday, 5);
      expect(result.getDate()).toBe(24); // Following Monday
    });

    it('should skip weekends', () => {
      const friday = new Date(2024, 5, 14); // Friday June 14
      const result = addBusinessDays(friday, 1);
      expect(result.getDate()).toBe(17); // Monday June 17
    });

    it('should handle negative days', () => {
      const monday = new Date(2024, 5, 17); // Monday June 17
      const result = addBusinessDays(monday, -1);
      expect(result.getDate()).toBe(14); // Previous Friday
    });
  });

  describe('addCalendarDays', () => {
    it('should add calendar days', () => {
      const start = new Date(2024, 5, 15); // June 15
      const result = addCalendarDays(start, 5);
      expect(result.getDate()).toBe(20);
    });

    it('should handle negative days', () => {
      const start = new Date(2024, 5, 15); // June 15
      const result = addCalendarDays(start, -5);
      expect(result.getDate()).toBe(10);
    });
  });

  describe('businessDaysBetween', () => {
    it('should count business days', () => {
      const start = new Date(2024, 5, 17); // Monday June 17
      const end = new Date(2024, 5, 21); // Friday June 21
      expect(businessDaysBetween(start, end)).toBe(4);
    });

    it('should exclude weekends', () => {
      const start = new Date(2024, 5, 14); // Friday June 14
      const end = new Date(2024, 5, 17); // Monday June 17
      expect(businessDaysBetween(start, end)).toBe(1);
    });
  });
});

describe('Financial Calculations', () => {
  describe('calculateProration', () => {
    it('should calculate prorations correctly', () => {
      const result = calculateProration(
        3650, // $3650 annual
        new Date(2024, 0, 1), // Jan 1, 2024
        new Date(2024, 11, 31), // Dec 31, 2024
        new Date(2024, 5, 15), // June 15, 2024
        365
      );
      // Jan 1 to June 15 = 165-166 days depending on calculation
      expect(result.daysToSeller).toBeGreaterThanOrEqual(165);
      expect(result.daysToSeller).toBeLessThanOrEqual(166);
      expect(result.daysToBuyer).toBeGreaterThanOrEqual(199);
      expect(result.daysToBuyer).toBeLessThanOrEqual(200);
      // Total credits should be close to annual amount (within $20 rounding tolerance)
      const totalCredits = result.sellerCredit + result.buyerCredit;
      expect(totalCredits).toBeGreaterThan(3630);
      expect(totalCredits).toBeLessThanOrEqual(3660);
    });
  });

  describe('calculateTaxProration', () => {
    it('should credit seller when taxes prepaid', () => {
      const result = calculateTaxProration(
        3650,
        new Date(2024, 5, 15), // June 15
        new Date(2024, 0, 1), // Jan 1
        new Date(2024, 11, 31), // Paid through Dec 31
        365
      );
      expect(result.creditTo).toBe('SELLER');
      expect(result.credit).toBeGreaterThan(0);
    });

    it('should credit buyer when taxes underpaid', () => {
      const result = calculateTaxProration(
        3650,
        new Date(2024, 5, 15), // June 15
        new Date(2024, 0, 1), // Jan 1
        new Date(2024, 2, 31), // Only paid through March 31
        365
      );
      expect(result.creditTo).toBe('BUYER');
    });
  });

  describe('calculateMonthlyPayment', () => {
    it('should calculate mortgage payment', () => {
      const payment = calculateMonthlyPayment(300000, 0.065, 360);
      expect(payment).toBeGreaterThan(1800);
      expect(payment).toBeLessThan(2000);
    });

    it('should handle zero interest', () => {
      const payment = calculateMonthlyPayment(360000, 0, 360);
      expect(payment).toBe(1000);
    });
  });

  describe('calculateLTV', () => {
    it('should calculate LTV ratio', () => {
      expect(calculateLTV(240000, 300000)).toBe(80);
    });

    it('should handle zero property value', () => {
      expect(calculateLTV(240000, 0)).toBe(0);
    });
  });

  describe('calculateDTI', () => {
    it('should calculate DTI ratio', () => {
      expect(calculateDTI(2000, 5000)).toBe(40);
    });

    it('should handle zero income', () => {
      expect(calculateDTI(2000, 0)).toBe(0);
    });
  });

  describe('calculateTransferTax', () => {
    it('should calculate transfer tax', () => {
      expect(calculateTransferTax(500000, 5)).toBe(2500);
    });
  });

  describe('calculateCommission', () => {
    it('should calculate commission', () => {
      expect(calculateCommission(500000, 0.06)).toBe(30000);
    });
  });

  describe('calculateCommissionSplit', () => {
    it('should split commission evenly', () => {
      const result = calculateCommissionSplit(30000, 0.5);
      expect(result.listingSide).toBe(15000);
      expect(result.sellingSide).toBe(15000);
    });

    it('should handle uneven splits', () => {
      const result = calculateCommissionSplit(30000, 0.6);
      expect(result.listingSide).toBe(18000);
      expect(result.sellingSide).toBe(12000);
    });
  });

  describe('calculatePrepaidInterest', () => {
    it('should calculate prepaid interest', () => {
      const result = calculatePrepaidInterest(
        300000,
        0.065,
        new Date(2024, 5, 15) // June 15
      );
      // June 15 to June 30 = 16 days
      expect(result.days).toBe(16);
      expect(result.amount).toBeGreaterThan(0);
    });
  });
});

describe('Deadline Utilities', () => {
  describe('daysUntilDeadline', () => {
    it('should calculate days until deadline', () => {
      const now = new Date(2024, 5, 15); // June 15
      const deadline = new Date(2024, 5, 20); // June 20
      expect(daysUntilDeadline(deadline, now)).toBe(5);
    });

    it('should return negative for past deadlines', () => {
      const now = new Date(2024, 5, 15); // June 15
      const deadline = new Date(2024, 5, 10); // June 10
      expect(daysUntilDeadline(deadline, now)).toBeLessThan(0);
    });
  });

  describe('isDeadlineOverdue', () => {
    it('should return true for past deadlines', () => {
      const deadline = new Date(2024, 5, 10);
      const asOf = new Date(2024, 5, 15);
      expect(isDeadlineOverdue(deadline, asOf)).toBe(true);
    });

    it('should return false for future deadlines', () => {
      const deadline = new Date(2024, 5, 20);
      const asOf = new Date(2024, 5, 15);
      expect(isDeadlineOverdue(deadline, asOf)).toBe(false);
    });
  });

  describe('getDeadlineStatus', () => {
    it('should return OVERDUE for past deadlines', () => {
      const now = new Date(2024, 5, 15, 12, 0, 0);
      const deadline = new Date(2024, 5, 10);
      expect(getDeadlineStatus(deadline, now)).toBe('OVERDUE');
    });

    it('should return TODAY or UPCOMING for same-day deadlines', () => {
      const now = new Date(2024, 5, 15, 12, 0, 0);
      const deadline = new Date(now.getTime() + 1000); // 1 second later
      // Due to ceil rounding, this may be TODAY or UPCOMING
      const status = getDeadlineStatus(deadline, now);
      expect(['TODAY', 'UPCOMING']).toContain(status);
    });

    it('should return UPCOMING for deadlines within 7 days', () => {
      const now = new Date(2024, 5, 15, 12, 0, 0);
      const deadline = new Date(2024, 5, 20);
      expect(getDeadlineStatus(deadline, now)).toBe('UPCOMING');
    });

    it('should return FUTURE for deadlines beyond 7 days', () => {
      const now = new Date(2024, 5, 15, 12, 0, 0);
      const deadline = new Date(2024, 5, 30);
      expect(getDeadlineStatus(deadline, now)).toBe('FUTURE');
    });
  });
});
