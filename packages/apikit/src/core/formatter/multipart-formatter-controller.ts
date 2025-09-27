import { isDefinedAndNotNull, isNonEmptyString } from '@nidavellirx/meowv-core';
import { injectable } from 'inversify';

export interface MultipartFormatterController {
  /**
   * Normalize multipart fields into JSON-compatible values.
   *
   * - "true"/"false" → boolean
   * - Numeric strings → number
   * - Valid JSON → parsed
   * - Fallback → plain string
   *
   * @param input Raw multipart fields as { [key: string]: unknown }
   * @returns Normalized fields as { [key: string]: unknown }
   */

  normalizeFields(input: Record<string, unknown>): Record<string, unknown>;
}

@injectable()
export class MultipartFormatterControllerImpl implements MultipartFormatterController {
  public normalizeFields(input: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(input)) {
      result[key] = this.normalizeValue(raw, key);
    }
    return result;
  }

  // MARK: - Private helpers

  private normalizeValue(input: unknown, _key: string): unknown {
    if (!isDefinedAndNotNull(input)) return undefined;
    if (!isNonEmptyString(input)) return input; // Already formatter

    const trimmed = input.trim();

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
      return input;
    }
  }
}
