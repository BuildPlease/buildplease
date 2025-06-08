/**
 * Try to map any input into one of the values of a TS enum.
 *
 * - Supports both string enums and numeric enums.
 * - Matches against both the enum’s **key** and its **value** (after normalization).
 * - Skips the “reverse-mapping” entries that TS emits for numeric enums.
 *
 * @param input   Anything the user passed in
 * @param enumObj The enum object you want to map into
 * @param options.normalize  Optional normalizer for comparing strings (default trims + uppercases)
 * @returns       One of the enum’s values, or null if nothing matches
 */
export function mapToEnum<V extends string | number, E extends Record<string, V>>(
  input: unknown,
  enumObj: E,
  options?: { normalize?: (s: string) => string },
): V | null {
  // only strings and numbers are allowed
  if (typeof input !== 'string' && typeof input !== 'number') {
    return null;
  }

  // default normalizer → trim + uppercase
  const normalize = options?.normalize ?? ((s) => s.trim().toUpperCase());

  // unify to a string for comparison
  const raw = typeof input === 'number' ? String(input) : input;
  const normalizedInput = normalize(raw);

  for (const [key, value] of Object.entries(enumObj)) {
    // skip TS’s reverse‐mapping entries for numeric enums (e.g. "0": "BASIC")
    if (!Number.isNaN(Number(key))) {
      continue;
    }

    // If it’s a number-valued enum
    if (typeof value === 'number') {
      // match numeric input
      if (!Number.isNaN(Number(raw)) && Number(raw) === value) {
        return value;
      }
      // match by key name
      if (normalize(key) === normalizedInput) {
        return value;
      }
    } else {
      // string-valued enum → match either the value or the key
      if (normalize(value) === normalizedInput || normalize(key) === normalizedInput) {
        return value;
      }
    }
  }

  return null;
}
