/**
 * Format date string according to user country (US/CA) and device time zone.
 * @param date - Date object, timestamp or ISO string
 * @param string - 'US' or 'CA'
 * @param options - Intl.DateTimeFormatOptions, like day/month/year
 */
export function toLocalizedDateString(
  date: string | number | Date,
  userCountry: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const locale = userCountry === 'CA' ? 'en-CA' : 'en-US';
  return new Date(date).toLocaleDateString(locale, options);
}

/**
 * Format date string according to user country (US/CA) and device time zone.
 * @param date - Date object, timestamp or ISO string
 * @param string - 'US' or 'CA'
 * @param options - Intl.DateTimeFormatOptions, like day/month/year
 */
export function toLocalizedTimeString(
  date: string | number | Date,
  userCountry: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const locale = userCountry === 'CA' ? 'en-CA' : 'en-US';
  return new Date(date).toLocaleTimeString(locale, options);
}
