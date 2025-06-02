import { DateTime } from '@/utils';

/**
 * Parses an input into a DateTime object if valid.
 *
 * @param {any} input
 *   The input value to parse (string or Date).
 *
 * @returns {DateTime|null}
 *   A DateTime object if the input is a valid date, or null otherwise.
 */
export function parseDate(input: any): DateTime | null {
  if (typeof input === 'string' || input instanceof Date) {
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      return new DateTime(date);
    }
  }
  return null;
}

/**
 * Parses an input into a DateTime object or throws an error if invalid.
 *
 * @param {any} input
 *   The input value to parse.
 *
 * @returns {DateTime}
 *   A DateTime object if the input is a valid date.
 *
 * @throws {Error}
 *   If the input is an invalid date.
 */
export function parseDateThrowing(input: any): DateTime {
  const dateTime = parseDate(input);
  if (!dateTime) {
    throw new Error('Invalid date input');
  }
  return dateTime;
}
