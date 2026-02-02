/**
 * Formatting utilities for IronClad
 * @module utils/formatters
 */

/**
 * Format currency amount
 * @param cents - Amount in cents
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 */
export const formatCurrency = (
  cents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format currency amount from dollars (not cents)
 * @param dollars - Amount in dollars
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 */
export const formatDollars = (
  dollars: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(dollars);
};

/**
 * Format currency with no cents (whole dollars)
 * @param dollars - Amount in dollars
 * @param currency - Currency code (default: USD)
 */
export const formatWholeDollars = (dollars: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
};

/**
 * Parse currency string to cents
 * @param value - Currency string (e.g., "$1,234.56")
 */
export const parseCurrencyToCents = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) {
    throw new Error(`Invalid currency value: ${value}`);
  }
  return Math.round(parsed * 100);
};

/**
 * Format phone number to US format
 * @param phone - Phone number (digits only or formatted)
 */
export const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Return as-is if not standard US format
  return phone;
};

/**
 * Format phone for international calling
 * @param phone - Phone number
 * @param countryCode - Country code (default: 1 for US)
 */
export const formatPhoneInternational = (phone: string, countryCode: string = '1'): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith(countryCode)) {
    return `+${digits}`;
  }
  return `+${countryCode}${digits}`;
};

/**
 * Format date to locale string
 * @param date - Date to format
 * @param locale - Locale (default: en-US)
 * @param options - Intl.DateTimeFormat options
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
};

/**
 * Format date to short format (MM/DD/YYYY)
 * @param date - Date to format
 */
export const formatDateShort = (date: Date | string): string => {
  return formatDate(date, 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Format date to legal format (Month Day, Year)
 * @param date - Date to format
 */
export const formatDateLegal = (date: Date | string): string => {
  return formatDate(date, 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date with time
 * @param date - Date to format
 * @param includeSeconds - Whether to include seconds
 */
export const formatDateTime = (date: Date | string, includeSeconds: boolean = false): string => {
  return formatDate(date, 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  });
};

/**
 * Format date relative to now
 * @param date - Date to format
 */
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
};

/**
 * Format address to single line
 * @param address - Address object
 */
export const formatAddressSingleLine = (address: {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}): string => {
  const parts = [address.street1];
  if (address.street2) parts.push(address.street2);
  parts.push(`${address.city}, ${address.state} ${address.zipCode}`);
  if (address.country && address.country !== 'US') {
    parts.push(address.country);
  }
  return parts.join(', ');
};

/**
 * Format address to multiple lines
 * @param address - Address object
 */
export const formatAddressMultiLine = (address: {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}): string => {
  const lines = [address.street1];
  if (address.street2) lines.push(address.street2);
  lines.push(`${address.city}, ${address.state} ${address.zipCode}`);
  if (address.country && address.country !== 'US') {
    lines.push(address.country);
  }
  return lines.join('\n');
};

/**
 * Format person's full name
 * @param parts - Name parts
 */
export const formatFullName = (parts: {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
}): string => {
  const nameParts = [parts.firstName];
  if (parts.middleName) nameParts.push(parts.middleName);
  nameParts.push(parts.lastName);
  if (parts.suffix) nameParts.push(parts.suffix);
  return nameParts.join(' ');
};

/**
 * Format name in legal style (Last, First Middle Suffix)
 * @param parts - Name parts
 */
export const formatNameLegal = (parts: {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
}): string => {
  let result = parts.lastName;
  if (parts.suffix) result += ` ${parts.suffix}`;
  result += `, ${parts.firstName}`;
  if (parts.middleName) result += ` ${parts.middleName}`;
  return result;
};

/**
 * Format percentage
 * @param value - Decimal value (e.g., 0.05 for 5%)
 * @param decimals - Decimal places (default: 2)
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format percentage from whole number
 * @param value - Whole number (e.g., 5 for 5%)
 * @param decimals - Decimal places (default: 2)
 */
export const formatPercentageWhole = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 * @param bytes - Size in bytes
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format matter number
 * @param year - Year
 * @param type - Type code (e.g., "RE" for real estate)
 * @param sequence - Sequence number
 */
export const formatMatterNumber = (year: number, type: string, sequence: number): string => {
  return `${year}-${type.toUpperCase()}-${sequence.toString().padStart(5, '0')}`;
};

/**
 * Format APN (Assessor's Parcel Number)
 * @param apn - Raw APN
 * @param format - Format pattern (default: XXX-XXX-XXX)
 */
export const formatAPN = (apn: string, format: string = '###-###-###'): string => {
  const digits = apn.replace(/\D/g, '');
  let result = '';
  let digitIndex = 0;

  for (const char of format) {
    if (char === '#') {
      if (digitIndex < digits.length) {
        result += digits[digitIndex];
        digitIndex++;
      }
    } else {
      result += char;
    }
  }

  // Append remaining digits if any
  if (digitIndex < digits.length) {
    result += digits.slice(digitIndex);
  }

  return result;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

/**
 * Format SSN (masked)
 * @param ssn - Full SSN
 * @param showLast - Number of digits to show (default: 4)
 */
export const formatSSNMasked = (ssn: string, showLast: number = 4): string => {
  const digits = ssn.replace(/\D/g, '');
  if (digits.length !== 9) return '***-**-****';
  return `***-**-${digits.slice(-showLast)}`;
};

/**
 * Format EIN
 * @param ein - EIN number
 */
export const formatEIN = (ein: string): string => {
  const digits = ein.replace(/\D/g, '');
  if (digits.length !== 9) return ein;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};
