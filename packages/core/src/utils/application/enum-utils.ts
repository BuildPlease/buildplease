/**
 * Try to map any input into one of the values of a TS enum.
 *
 * - Supports string and numeric enums.
 * - Compares against both the enum’s KEY and VALUE (after normalization).
 * - Skips the reverse-mapping keys TS emits for numeric enums (e.g. "0").
 *
 * @param input   Anything; only strings/numbers are considered (others → null).
 * @param enumObj The enum object to map into.
 * @param options.normalize  Optional normalizer (default: trim + uppercase).
 * @returns       One of the enum’s values (E[keyof E]) or null if no match.
 */
export function mapToEnum<E extends Record<string, string | number>>(
  input: unknown,
  enumObj: E,
  options?: { normalize?: (s: string) => string },
): E[keyof E] | null {
  if (typeof input !== 'string' && typeof input !== 'number') return null;

  const normalize = options?.normalize ?? ((s: string) => s.trim().toUpperCase());
  const rawStr = String(input);
  const normalizedInput = normalize(rawStr);

  for (const [key, value] of Object.entries(enumObj)) {
    // Skip TS reverse-mapping for numeric enums (e.g. "0": "BASIC")
    if (!Number.isNaN(Number(key))) continue;

    if (typeof value === 'number') {
      // numeric enums: match by number value or by KEY
      if (!Number.isNaN(Number(rawStr)) && Number(rawStr) === value) return value as E[keyof E];
      if (normalize(key) === normalizedInput) return value as E[keyof E];
    } else {
      // string enums: match by VALUE or KEY
      if (normalize(value) === normalizedInput || normalize(key) === normalizedInput) {
        return value as E[keyof E];
      }
    }
  }
  return null;
}
