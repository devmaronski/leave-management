import { format, parseISO, isValid } from 'date-fns';

/**
 * Safely formats a date string to a human-readable format
 * @param dateString - ISO 8601 date string
 * @param formatStr - date-fns format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string or the original string if invalid
 */
export function formatDate(
  dateString: string,
  formatStr: string = 'MMM dd, yyyy'
): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return dateString;
    }
    return format(date, formatStr);
  } catch {
    return dateString;
  }
}

/**
 * Converts a date string to YYYY-MM-DD format for input[type="date"]
 * @param dateString - ISO 8601 date string
 * @returns Date in YYYY-MM-DD format
 */
export function toDateInputValue(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return '';
    }
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns Today's date
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
