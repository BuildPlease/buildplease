/**
 * Normalize a locale tag.
 *
 * - Converts to lowercase
 * - Replaces underscores with dashes
 * - Trims whitespace
 *
 * @param input - The raw locale string (e.g. "EN_us")
 * @returns Normalized locale (e.g. "en-us"), or empty string if invalid
 */
export function normalizeLocale(input?: string): string {
  return (input ?? '').toLowerCase().replace(/_/g, '-').trim();
}

/**
 * Split a normalized locale into base and region parts.
 *
 * @param input - Normalized locale string (e.g. "en-gb", "sk")
 * @returns Object with:
 *   - `base`: the primary language code (always string, never undefined)
 *   - `region`: optional region code if present (e.g. "gb")
 *
 * @example
 * splitBaseRegion("en-gb") // { base: "en", region: "gb" }
 * splitBaseRegion("sk")    // { base: "sk", region: undefined }
 */
export function splitBaseRegion(input: string): { base: string; region?: string } {
  const [base, region] = input.split('-');
  return { base: base || '', region };
}
