/**
 * Transforms an empty string or undefined to `null`. Otherwise, returns the string as is.
 * This is useful when you want to ensure that database entries do not store empty strings or undefined.
 *
 * @param {string | null | undefined} value - The string to transform.
 * @returns {string | null} - Returns `null` if the input is an empty string or undefined, otherwise returns the input string.
 */
export function emptyOrUndefinedStringToNull(value: string | null | undefined): string | null {
  return value === '' || value === undefined ? null : value;
}

/**
 * Validates if a given string is non-empty after trimming whitespace.
 * This function is typically used to ensure that essential string fields
 * do not contain only whitespace before saving to a database.
 *
 * @param {string} value - The string to validate.
 * @returns {boolean} - Returns `true` if the string is non-empty after trimming, otherwise `false`.
 */
export function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Checks if a given string is null, undefined, or empty after trimming whitespace.
 * This function is typically used to ensure that essential string fields
 * are not empty or only contain whitespace before processing.
 *
 * @param {string | null | undefined} value - The string to check.
 * @returns {boolean} - Returns `true` if the string is null, undefined, or empty after trimming, otherwise `false`.
 */
export function isNullOrEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim().length === 0;
}

/**
 * Capitalizes the first character of a string and returns the new string.
 * If the string is null, undefined, or empty (after trimming), it returns `null`.
 *
 * @param {string | null | undefined} value - The string to capitalize.
 * @returns {string | null} - Returns the capitalized string, or `null` if input is invalid.
 */
export function capitalized(value: string | null | undefined): string | null {
  if (isNullOrEmpty(value)) return null;
  return value!.charAt(0).toUpperCase() + value!.slice(1);
}
