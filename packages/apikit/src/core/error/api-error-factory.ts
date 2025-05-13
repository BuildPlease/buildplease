import type { LocalizedApiError } from '#/error';
import { ApiError, ApiErrorCodes } from '#/error';
import { type LocalizationOptions, LocalizationProvider } from '#/localization';

export interface ApiErrorFactoryOptions extends LocalizationOptions {
  /**
   * Overrides the localized message for this error.
   * Use this to supply a custom error message instead of a translated one.
   */
  message?: string;

  /**
   * Additional technical or contextual information about the error.
   * This is useful for internal debugging and will be included in the serialized error response.
   */
  details?: string;
}

export class ApiErrorFactory {
  static make<K extends AllErrorKeys>(key: K, options: ApiErrorFactoryOptions = {}): ApiError {
    const def: ErrorByKey<K> = getErrorByPath(ApiErrorCodes, key);
    const message = options.message ?? LocalizationProvider.t(def.key, options);

    return new ApiError({
      code: def.code,
      statusCode: def.statusCode,
      message,
      details: options.details,
    });
  }
}

// MARK: - Private

function getErrorByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * Flattens a nested error tree into dot-notation string keys.
 *
 * @template T - The nested error object.
 * @template P - Used for recursive path prefixing.
 * @example
 * // From:
 * // { Auth: { UNAUTHORIZED: { ... } } }
 * // To: "Auth.UNAUTHORIZED"
 */
type Flatten<T, P extends string = ''> = {
  [K in keyof T]: T[K] extends LocalizedApiError
    ? `${P}${K & string}`
    : Flatten<T[K], `${P}${K & string}.`>;
}[keyof T];

/**
 * Resolves a nested value by a flattened dot-notation key.
 *
 * @template T - The object tree to traverse.
 * @template P - The dot-separated path (e.g., "Auth.UNAUTHORIZED").
 */

type ValueAtPath<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? ValueAtPath<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

/**
 * All valid error keys derived from the nested error tree.
 * Used for autocomplete and compile-time safety.
 *
 * @example
 * 'Validation.INVALID_EMAIL_FORMAT'
 * 'Server.TIMEOUT'
 */
type AllErrorKeys = Flatten<typeof ApiErrorCodes>;

/**
 * Resolves the full `LocalizedApiError` type for a given dot-notation key.
 *
 * @template K - A valid key from `AllErrorKeys`.
 * @example
 * ErrorByKey<'Validation.INVALID_FORMAT'> -> { code, key, statusCode }
 */
type ErrorByKey<K extends AllErrorKeys> = ValueAtPath<typeof ApiErrorCodes, K>;
