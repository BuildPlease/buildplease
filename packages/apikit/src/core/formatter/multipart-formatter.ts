import { injectable } from 'inversify';

export interface MultipartFormatter {
  /**
   * Normalize multipart fields into JSON-compatible values.
   *
   * - "true"/"false" → boolean
   * - Numeric strings → number
   * - Valid JSON → parsed
   * - Fallback → plain string
   *
   * @param fields Raw multipart fields as { [key: string]: unknown }
   * @returns Normalized fields as { [key: string]: unknown }
   */
  normalizeParts(fields: Record<string, unknown>): Record<string, unknown>;
}

@injectable()
export class MultipartFormatterImpl implements MultipartFormatter {
  public normalizeParts(fields: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, raw] of Object.entries(fields)) {
      result[key] = this.normalizeValue(raw, key);
    }

    return result;
  }

  // MARK: - Private helpers

  private normalizeValue(raw: unknown, _key: string): unknown {
    if (raw == null) return undefined;

    if (typeof raw !== 'string') {
      // Already normalized, passthrough
      return raw;
    }

    const trimmed = raw.trim();

    // Boolean coercion
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // Numeric coercion
    if (!Number.isNaN(Number(trimmed)) && trimmed !== '') {
      return Number(trimmed);
    }

    // JSON parse attempt
    try {
      return JSON.parse(trimmed);
    } catch {
      return raw;
    }
  }
}
