import merge from 'lodash.merge';

import { type RecursiveErrorTree, type LocalizedApiError, ApiError, ApiErrorCodes } from '#/error';
import { type I18nOptions, I18nProvider } from '#/i18n';

/**
 * Options for creating a localized API error.
 *
 * @property {string} [message]  Override for translated error message
 * @property {string} [details]  Technical details for debugging or logging
 */
export interface ApiErrorFactoryOptions extends I18nOptions {
  message?: string;
  details?: string;
}

/**
 * Factory for creating standardized, localized API errors.
 *
 * @example
 * // Extend with custom errors
 * const NotificationErrors = defineErrors({
 *   PUSH_NOTIFICATIONS_DISABLED: {
 *     code: 'PUSH_NOTIFICATIONS_DISABLED',
 *     key: 'errors.notification.push_notifications_disabled',
 *     statusCode: 409,
 *   },
 * });
 * ApiErrorFactory.extend(NotificationErrors);
 *
 * @example
 * // Create an error with default translation
 * ApiErrorFactory.make('Validation.INVALID_EMAIL');
 *
 * @example
 * // Create an error with custom message
 * ApiErrorFactory.make('Validation.INVALID_EMAIL', {
 *   message: 'The provided email address is not formatted correctly.',
 * });
 *
 * @example
 * // Create an error with custom message and debug details
 * ApiErrorFactory.make('Validation.INVALID_EMAIL', {
 *   message: 'Invalid email format',
 *   details: 'Received value: user@example',
 * });
 *
 * @example
 * // Create an error with forced locale and details
 * ApiErrorFactory.make('Validation.INVALID_EMAIL', {
 *   lng: 'es',
 *   message: 'Formato de correo electrónico inválido',
 *   details: 'Valor recibido: user@example',
 * });
 */
export class ApiErrorFactory {
  /**
   * Create an API error from built-in definitions.
   *
   * @param key   Dot-separated path to error definition, e.g. 'Validation.INVALID_EMAIL'
   * @param opts  Options for message override, details, or locale
   * @returns     Configured ApiError instance
   * @throws      Error if the key path is invalid
   */
  static make(key: BuiltInKeys, opts: ApiErrorFactoryOptions = {}): ApiError {
    const def = getErrorByPath(ApiErrorCodes, key);
    if (!def) throw new Error(`Invalid error key: ${key}`);

    return new ApiError({
      code: def.code,
      statusCode: def.statusCode,
      message: opts.message ?? I18nProvider.t(def.key, opts),
      details: opts.details,
    });
  }

  /**
   * Extend the factory with additional error definitions.
   *
   * @param extra  Custom error hierarchy to merge
   * @returns      A new factory class with combined error definitions
   *
   * @example
   * const InventoryErrors = ApiErrorFactory.extend({
   *   Stock: {
   *     OutOfStock: {
   *       code: 'STOCK_EMPTY',
   *       statusCode: 409,
   *       key: 'errors.inventory.out_of_stock',
   *     }
   *   }
   * });
   */
  static extend<Extra extends Record<string, RecursiveErrorTree>>(extra: Extra) {
    const mergedCodes = merge({}, ApiErrorCodes, extra) as typeof ApiErrorCodes & Extra;

    return class ExtendedErrorFactory {
      /** @readonly Merged error definitions */
      static readonly codes = mergedCodes;

      /**
       * Create an error from merged definitions.
       *
       * @param key   Dot-separated path in combined error hierarchy
       * @param opts  Options for message override, details, or locale
       * @returns     Configured ApiError instance
       * @throws      Error if the key path is invalid
       */
      static make(key: Flatten<typeof mergedCodes>, opts: ApiErrorFactoryOptions = {}): ApiError {
        const def = getErrorByPath(this.codes, key);
        if (!def) throw new Error(`Invalid extended error key: ${key}`);

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

/** Union of all valid built-in error paths */
type BuiltInKeys = Flatten<typeof ApiErrorCodes>;

/**
 * Retrieve an error definition by its dot-separated path.
 *
 * @private
 * @param obj   Root error definitions object
 * @param path  Dot-separated key path
 * @returns     Found LocalizedApiError or undefined
 *
 * @example
 * const def = getErrorByPath(ApiErrorCodes, 'Validation.INVALID_EMAIL');
 */
function getErrorByPath(obj: object, path: string): LocalizedApiError {
  return path.split('.').reduce<any>((acc, key) => acc?.[key], obj);
}
