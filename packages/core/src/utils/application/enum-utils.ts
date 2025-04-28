/**
 * Converts a string input to a matching enum value by applying normalization.
 *
 * @template T - An enum type whose values are of type `string | number`.
 * @param input - The input string to match with an enum value.
 * @param enumObject - The enum object containing possible values.
 * @param options - Optional settings for matching.
 * @param options.normalize - A function to normalize both input and enum values for comparison.
 * @param options.matchBy - Determines whether to match by enum `key` or `value`. Defaults to `value`.
 * @returns The matched enum value or `null` if no match is found.
 */
// MARK: - Main Function
export function mapStringToEnum<T extends Record<string, string | number>>(
  input: string | null | undefined,
  enumObject: T,
  options?: {
    normalize?: (input: string) => string;
    matchBy?: 'value' | 'key';
  },
): T[keyof T] | null {
  // MARK: - Handle null or undefined input
  if (!input) return null;

  // MARK: - Define normalization function
  // Default normalization to trim and uppercase input if no custom function is provided
  const defaultNormalize = (s: string) => s.trim().toUpperCase();
  const normalizeFn = options?.normalize || defaultNormalize;

  // Normalize the input once for consistent matching
  const normalizedInput = normalizeFn(input);

  // MARK: - Retrieve enum entries
  // Convert enum object entries into [key, value] pairs
  const entries = Object.entries(enumObject) as [keyof T, T[keyof T]][];

  // MARK: - Enum matching loop
  for (const [key, value] of entries) {
    // Determine if comparison should be by key or value, and convert to string for safe normalization
    const compareValue = options?.matchBy === 'key' ? String(key) : String(value);
    if (normalizeFn(compareValue) === normalizedInput) {
      return value;
    }
  }

  // MARK: - Return null if no match is found
  return null;
}
