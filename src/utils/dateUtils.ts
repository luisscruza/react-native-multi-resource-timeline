/**
 * Date utility functions to replace CalendarUtils from react-native-calendars
 * This eliminates the need for the react-native-calendars peer dependency
 */

/**
 * Converts a Date object to a calendar date string in YYYY-MM-DD format
 * @param date - The Date object to convert
 * @returns A string in YYYY-MM-DD format
 */
export const getCalendarDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Checks if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return getCalendarDateString(date1) === getCalendarDateString(date2);
};

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Formats a date string (YYYY-MM-DD) for display
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDateString = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
): string => {
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  return date.toLocaleDateString(undefined, options);
};

/**
 * Gets the start and end of a day for a given date string
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Object with start and end Date objects
 */
export const getDayBounds = (dateString: string) => {
  const start = new Date(dateString + 'T00:00:00');
  const end = new Date(dateString + 'T23:59:59.999');
  return { start, end };
};
