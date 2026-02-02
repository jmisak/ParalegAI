/**
 * Calculation utilities for IronClad
 * @module utils/calculations
 */

import {
  FEDERAL_HOLIDAYS,
  FLOATING_HOLIDAYS,
  type DeadlineDefinition,
  type BaseDateReference,
} from '../constants/deadlines';

/**
 * Check if a date is a weekend
 * @param date - Date to check
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Get the Nth occurrence of a weekday in a month
 * @param year - Year
 * @param month - Month (1-12)
 * @param weekday - Day of week (0=Sunday, 1=Monday, etc.)
 * @param occurrence - Which occurrence (1=first, -1=last)
 */
const getNthWeekdayOfMonth = (
  year: number,
  month: number,
  weekday: number,
  occurrence: number
): Date => {
  if (occurrence > 0) {
    // Find first occurrence
    const firstDay = new Date(year, month - 1, 1);
    let dayOffset = weekday - firstDay.getDay();
    if (dayOffset < 0) dayOffset += 7;
    const firstOccurrence = 1 + dayOffset;
    const targetDay = firstOccurrence + (occurrence - 1) * 7;
    return new Date(year, month - 1, targetDay);
  } else {
    // Find last occurrence
    const lastDay = new Date(year, month, 0);
    let dayOffset = lastDay.getDay() - weekday;
    if (dayOffset < 0) dayOffset += 7;
    const lastOccurrence = lastDay.getDate() - dayOffset;
    return new Date(year, month - 1, lastOccurrence);
  }
};

/**
 * Get all federal holidays for a year
 * @param year - Year to get holidays for
 */
export const getFederalHolidays = (year: number): Date[] => {
  const holidays: Date[] = [];

  // Fixed holidays
  for (const holiday of FEDERAL_HOLIDAYS) {
    let date = new Date(year, holiday.month - 1, holiday.day);

    // Observed rule: if holiday falls on Saturday, observe Friday
    // If holiday falls on Sunday, observe Monday
    if (date.getDay() === 6) {
      date = new Date(year, holiday.month - 1, holiday.day - 1);
    } else if (date.getDay() === 0) {
      date = new Date(year, holiday.month - 1, holiday.day + 1);
    }

    holidays.push(date);
  }

  // Floating holidays
  for (const holiday of FLOATING_HOLIDAYS) {
    const date = getNthWeekdayOfMonth(year, holiday.month, holiday.weekday, holiday.occurrence);
    holidays.push(date);
  }

  return holidays.sort((a, b) => a.getTime() - b.getTime());
};

/**
 * Check if a date is a federal holiday
 * @param date - Date to check
 */
export const isFederalHoliday = (date: Date): boolean => {
  const holidays = getFederalHolidays(date.getFullYear());
  const dateStr = date.toISOString().split('T')[0];
  return holidays.some((h) => h.toISOString().split('T')[0] === dateStr);
};

/**
 * Check if a date is a business day
 * @param date - Date to check
 * @param excludeHolidays - Whether to exclude federal holidays
 */
export const isBusinessDay = (date: Date, excludeHolidays: boolean = true): boolean => {
  if (isWeekend(date)) return false;
  if (excludeHolidays && isFederalHoliday(date)) return false;
  return true;
};

/**
 * Add business days to a date
 * @param date - Starting date
 * @param days - Number of business days to add (can be negative)
 * @param excludeHolidays - Whether to exclude federal holidays
 */
export const addBusinessDays = (
  date: Date,
  days: number,
  excludeHolidays: boolean = true
): Date => {
  const result = new Date(date);
  const direction = days >= 0 ? 1 : -1;
  let remaining = Math.abs(days);

  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    if (isBusinessDay(result, excludeHolidays)) {
      remaining--;
    }
  }

  return result;
};

/**
 * Add calendar days to a date
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 */
export const addCalendarDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculate a deadline date
 * @param definition - Deadline definition
 * @param baseDates - Map of base date references to actual dates
 */
export const calculateDeadline = (
  definition: DeadlineDefinition,
  baseDates: Partial<Record<BaseDateReference, Date>>
): Date | null => {
  const baseDate = baseDates[definition.baseDateReference];
  if (!baseDate) return null;

  if (definition.calendarType === 'BUSINESS') {
    return addBusinessDays(baseDate, definition.daysOffset, true);
  }

  return addCalendarDays(baseDate, definition.daysOffset);
};

/**
 * Calculate business days between two dates
 * @param start - Start date
 * @param end - End date
 * @param excludeHolidays - Whether to exclude federal holidays
 */
export const businessDaysBetween = (
  start: Date,
  end: Date,
  excludeHolidays: boolean = true
): number => {
  let count = 0;
  const current = new Date(start);
  const direction = end >= start ? 1 : -1;

  while (
    (direction === 1 && current < end) ||
    (direction === -1 && current > end)
  ) {
    current.setDate(current.getDate() + direction);
    if (isBusinessDay(current, excludeHolidays)) {
      count++;
    }
  }

  return count;
};

/**
 * Calculate prorated amount
 * @param annualAmount - Annual amount
 * @param startDate - Start date of proration period
 * @param endDate - End date of proration period
 * @param prorationDate - Date to prorate to
 * @param daysInYear - Days in year basis (360 or 365/366)
 */
export const calculateProration = (
  annualAmount: number,
  startDate: Date,
  endDate: Date,
  prorationDate: Date,
  daysInYear: 360 | 365 | 366 = 365
): { sellerCredit: number; buyerCredit: number; daysToSeller: number; daysToBuyer: number } => {
  const dailyRate = annualAmount / daysInYear;

  // Calculate days from start to proration date (seller's portion)
  const daysToSeller = Math.floor(
    (prorationDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate days from proration date to end (buyer's portion)
  const daysToBuyer = Math.floor(
    (endDate.getTime() - prorationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const sellerCredit = Math.round(daysToSeller * dailyRate * 100) / 100;
  const buyerCredit = Math.round(daysToBuyer * dailyRate * 100) / 100;

  return {
    sellerCredit,
    buyerCredit,
    daysToSeller,
    daysToBuyer,
  };
};

/**
 * Calculate property tax proration
 * @param annualTax - Annual tax amount
 * @param closingDate - Closing date
 * @param taxYearStart - Tax year start (default: January 1)
 * @param paidThroughDate - Date taxes are paid through
 * @param daysInYear - Days in year basis
 */
export const calculateTaxProration = (
  annualTax: number,
  closingDate: Date,
  _taxYearStart: Date = new Date(closingDate.getFullYear(), 0, 1),
  paidThroughDate: Date,
  daysInYear: 360 | 365 | 366 = 365
): { credit: number; creditTo: 'BUYER' | 'SELLER' } => {
  // If taxes are paid through a date AFTER closing, seller gets credit
  // If taxes are paid through a date BEFORE closing, buyer gets credit
  if (paidThroughDate >= closingDate) {
    // Seller overpaid, gets credit from buyer
    const creditDays = Math.floor(
      (paidThroughDate.getTime() - closingDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const credit = Math.round((creditDays * annualTax) / daysInYear * 100) / 100;
    return { credit, creditTo: 'SELLER' };
  } else {
    // Seller underpaid, buyer gets credit
    const creditDays = Math.floor(
      (closingDate.getTime() - paidThroughDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const credit = Math.round((creditDays * annualTax) / daysInYear * 100) / 100;
    return { credit, creditTo: 'BUYER' };
  }
};

/**
 * Calculate monthly mortgage payment
 * @param principal - Loan principal
 * @param annualRate - Annual interest rate (e.g., 0.065 for 6.5%)
 * @param termMonths - Loan term in months
 */
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  termMonths: number
): number => {
  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.round(payment * 100) / 100;
};

/**
 * Calculate loan-to-value ratio
 * @param loanAmount - Loan amount
 * @param propertyValue - Property value
 */
export const calculateLTV = (loanAmount: number, propertyValue: number): number => {
  if (propertyValue === 0) return 0;
  return Math.round((loanAmount / propertyValue) * 10000) / 100;
};

/**
 * Calculate debt-to-income ratio
 * @param monthlyDebt - Total monthly debt payments
 * @param monthlyIncome - Gross monthly income
 */
export const calculateDTI = (monthlyDebt: number, monthlyIncome: number): number => {
  if (monthlyIncome === 0) return 0;
  return Math.round((monthlyDebt / monthlyIncome) * 10000) / 100;
};

/**
 * Calculate transfer tax
 * @param salePrice - Sale price
 * @param ratePerThousand - Tax rate per $1000
 */
export const calculateTransferTax = (salePrice: number, ratePerThousand: number): number => {
  return Math.round((salePrice / 1000) * ratePerThousand * 100) / 100;
};

/**
 * Calculate commission
 * @param salePrice - Sale price
 * @param commissionRate - Commission rate (e.g., 0.06 for 6%)
 */
export const calculateCommission = (salePrice: number, commissionRate: number): number => {
  return Math.round(salePrice * commissionRate * 100) / 100;
};

/**
 * Calculate commission split
 * @param totalCommission - Total commission amount
 * @param listingSidePercent - Listing side percentage (e.g., 0.5 for 50%)
 */
export const calculateCommissionSplit = (
  totalCommission: number,
  listingSidePercent: number
): { listingSide: number; sellingSide: number } => {
  const listingSide = Math.round(totalCommission * listingSidePercent * 100) / 100;
  const sellingSide = Math.round(totalCommission * (1 - listingSidePercent) * 100) / 100;
  return { listingSide, sellingSide };
};

/**
 * Calculate recording fees
 * @param pages - Number of pages
 * @param baseFeePer Page - Base fee per page
 * @param additionalFees - Additional flat fees
 */
export const calculateRecordingFees = (
  pages: number,
  baseFeePerPage: number,
  additionalFees: number = 0
): number => {
  return pages * baseFeePerPage + additionalFees;
};

/**
 * Calculate prepaid interest
 * @param loanAmount - Loan amount
 * @param annualRate - Annual interest rate
 * @param closingDate - Closing date
 */
export const calculatePrepaidInterest = (
  loanAmount: number,
  annualRate: number,
  closingDate: Date
): { amount: number; days: number } => {
  const dailyRate = annualRate / 365;
  const lastDayOfMonth = new Date(closingDate.getFullYear(), closingDate.getMonth() + 1, 0);
  const daysRemaining = lastDayOfMonth.getDate() - closingDate.getDate() + 1;
  const amount = Math.round(loanAmount * dailyRate * daysRemaining * 100) / 100;

  return { amount, days: daysRemaining };
};

/**
 * Calculate days until deadline
 * @param deadline - Deadline date
 * @param from - Reference date (default: now)
 */
export const daysUntilDeadline = (deadline: Date, from: Date = new Date()): number => {
  const diff = deadline.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if a deadline is overdue
 * @param deadline - Deadline date
 * @param asOf - Reference date (default: now)
 */
export const isDeadlineOverdue = (deadline: Date, asOf: Date = new Date()): boolean => {
  return deadline < asOf;
};

/**
 * Get deadline status
 * @param deadline - Deadline date
 * @param asOf - Reference date (default: now)
 */
export const getDeadlineStatus = (
  deadline: Date,
  asOf: Date = new Date()
): 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'FUTURE' => {
  const days = daysUntilDeadline(deadline, asOf);

  if (days < 0) return 'OVERDUE';
  if (days === 0) return 'TODAY';
  if (days <= 7) return 'UPCOMING';
  return 'FUTURE';
};
