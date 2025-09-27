/**
 * Checks if the value is a string and non-empty after trimming.
 *
 * @param value The value to check.
 * @returns True if value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Checks if the value is null, undefined, or an empty string after trimming.
 *
 * @param value The value to check.
 * @returns True if value is null, undefined, or empty string.
 */
export function isNullOrEmpty(value: unknown): value is null | undefined | '' {
  return value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0);
}

/**
 * Transforms an empty string or undefined to `null`. Otherwise, returns the string as is.
 */
export function emptyOrUndefinedStringToNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value === '' ? null : value;
}

/**
 * Capitalizes the first character of a string.
 * Returns `null` if the input is not a valid non-empty string.
 */
export function capitalized(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
