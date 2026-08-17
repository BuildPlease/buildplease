import { isNonEmptyString } from '@buildplease/core';
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
    if (input === undefined) return undefined;
    if (input === null) return null;
    if (!isNonEmptyString(input)) return input;

    const trimmed = input.trim();

    if (trimmed === '') return input;
    if (trimmed === 'null') return null;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (!Number.isNaN(Number(trimmed))) return Number(trimmed);

    try {
      return JSON.parse(trimmed);
    } catch {
      return input;
    }
  }
}
