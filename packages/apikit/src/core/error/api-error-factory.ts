import merge from 'lodash.merge';

import {
  type RecursiveErrorTree,
  type LocalizedApiError,
  type ApiErrorDetails,
  ApiError,
  ApiErrorCodes,
} from '#/error';
import { type I18nOptions, I18nProvider } from '#/i18n';

/**
 * Options for creating a localized API error.
 *
 * @property {string} [message]
 *   Override for translated error message.
 * @property {string} [details]
 *   Technical details for debugging or logging.
 */
export interface ApiErrorFactoryOptions extends I18nOptions {
  message?: string;
  details?: ApiErrorDetails;
}

/**
 * Factory for creating standardized, localized API errors.
 *
 * @example
 * // Define individual error groups first
 * import { defineErrors } from '@nidavellirx/meowv-apikit';
 *
 * export const AccountErrors = defineErrors({
 *   ACCOUNT_NOT_FOUND: {
 *     code: 'ACCOUNT_NOT_FOUND',
 *     key: 'errors.account.not_found',
 *     statusCode: 404,
 *   },
 *   ACCOUNT_IS_BLOCKED: {
 *     code: 'ACCOUNT_IS_BLOCKED',
 *     key: 'errors.account.is_blocked',
 *     statusCode: 401,
 *   },
 * });
 *
 * // Combine groups under a single namespace
 * const ErrorCodes = defineErrors({
 *   Account: AccountErrors,
 * });
 *
 * // Extend ApiErrorFactory with the combined definitions
 * export const ErrorFactory = ApiErrorFactory.extend(ErrorCodes);
 *
 * // Then elsewhere, create errors via:
 * ErrorFactory.make('Account.ACCOUNT_NOT_FOUND');
 */
export class ApiErrorFactory {
  /**
   * Create an API error from built-in definitions.
   *
   * @param {BuiltInKeys} key
   *   Dot-separated path to error definition (e.g. 'Validation.INVALID_EMAIL').
   * @param {ApiErrorFactoryOptions} [opts]
   *   Options for message override, details, or locale.
   *
   * @returns {ApiError}
   *   Configured ApiError instance.
   *
   * @throws {Error}
   *   If the key path is invalid.
   */
  static make(key: BuiltInKeys, opts: ApiErrorFactoryOptions = {}): ApiError {
    const def = getErrorByPath(ApiErrorCodes, key);
    if (!def) throw new Error(`Invalid error key: ${key}`);

    const { message, details, ...i18nOptions } = opts;

    return new ApiError({
      code: def.code,
      statusCode: def.statusCode,
      message: message ?? I18nProvider.t(def.key, i18nOptions),
      details,
    });
  }

  /**
   * Extend the factory with additional error definitions.
   *
   * @param extra
   *   Custom error hierarchy to merge.
   *
   * @returns
   *   A new factory class with combined error definitions.
   *
   * @example
   * // Using defineErrors to build nested groups:
   * import { defineErrors } from '@nidavellirx/meowv-apikit';
   *
   * export const AccountErrors = defineErrors({
   *   ACCOUNT_NOT_FOUND: {
   *     code: 'ACCOUNT_NOT_FOUND',
   *     key: 'errors.account.not_found',
   *     statusCode: 404,
   *   },
   * });
   *
   * const ErrorCodes = defineErrors({ Account: AccountErrors });
   * export const ErrorFactory = ApiErrorFactory.extend(ErrorCodes);
   *
   * // Now:
   * ErrorFactory.make('Account.ACCOUNT_NOT_FOUND');
   */
  static extend<Extra extends Record<string, RecursiveErrorTree>>(extra: Extra) {
    const mergedCodes = merge({}, ApiErrorCodes, extra) as typeof ApiErrorCodes & Extra;

    return class ExtendedErrorFactory {
      /** @readonly Merged error definitions */
      static readonly codes = mergedCodes;

      /**
       * Create an error from merged definitions.
       *
       * @param {Flatten<typeof mergedCodes>} key
       *   Dot-separated path in combined error hierarchy.
       * @param {ApiErrorFactoryOptions} [opts]
       *   Options for message override, details, or locale.
       *
       * @returns {ApiError}
       *   Configured ApiError instance.
       *
       * @throws {Error}
       *   If the key path is invalid.
       */
      static make(key: Flatten<typeof mergedCodes>, opts: ApiErrorFactoryOptions = {}): ApiError {
        const def = getErrorByPath(this.codes, key);
        if (!def) {
          throw new Error(`Invalid extended error key: ${key}`);
        }

        return new ApiError({
          code: def.code,
          statusCode: def.statusCode,
          message: opts.message ?? I18nProvider.t(def.key, opts),
          details: opts.details,
        });
      }

      /** @inheritDoc ApiErrorFactory.extend */
      static extend = ApiErrorFactory.extend;
    };
  }
}

// MARK: - Private Implementation

/**
 * Generate dot-separated paths for nested error keys.
 *
 * @example
 * type Example = Flatten<{
 *   A: { B: LocalizedApiError },
 *   C: { D: { E: LocalizedApiError } }
 * }>;
 * // Result: "A.B" | "C.D.E"
 */
type Flatten<T> = T extends LocalizedApiError
  ? ''
  : {
        [K in keyof T]: K extends string
          ? `${K}${T[K] extends LocalizedApiError ? '' : '.'}${Flatten<T[K]>}`
          : never;
      }[keyof T] extends infer D
    ? D extends string
      ? D
      : never
    : never;

/** Union of all valid built-in error paths. */
type BuiltInKeys = Flatten<typeof ApiErrorCodes>;

/**
 * Retrieve an error definition by its dot-separated path.
 *
 * @private
 *
 * @param {object} obj
 *   Root error definitions object.
 * @param {string} path
 *   Dot-separated key path.
 *
 * @returns {LocalizedApiError | undefined}
 *   Found LocalizedApiError, or undefined if not found.
 *
 * @example
 * const def = getErrorByPath(ApiErrorCodes, 'Validation.INVALID_EMAIL');
 */
function getErrorByPath(obj: object, path: string): LocalizedApiError {
  return path.split('.').reduce<any>((acc, key) => acc?.[key], obj);
}
