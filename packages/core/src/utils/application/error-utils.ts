/**
 * Checks if a value is an Error instance.
 *
 * @param value - Value to check.
 * @returns True if the value is an Error.
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}
