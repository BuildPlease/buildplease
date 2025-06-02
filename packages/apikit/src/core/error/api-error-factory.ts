import merge from 'lodash.merge';

import type { LocalizedApiError } from '#/error';
import { type RecursiveErrorTree, ApiError, ApiErrorCodes } from '#/error';
import { type I18nOptions, I18nProvider } from '#/i18n';

/**
 * Configuration options for creating API errors with localized messages
 * @extends I18nOptions
 *
 * @property {string} [message] - Optional override for translated error message
 * @property {string} [details] - Technical details for debugging/logging purposes
 *
 * @example
 * // Create error with custom message and debug details
 * ApiErrorFactory.make('Validation.INVALID_EMAIL', {
 *   message: 'Invalid email format',
 *   details: 'Received value: user@example',
 *   lng: 'es' // Force Spanish translation
 * });
 */
export interface ApiErrorFactoryOptions extends I18nOptions {
  message?: string;
  details?: string;
}

/**
 * Factory class for creating standardized, localized API errors
 *
 * @class
 *
 * @example
 * // Extended factory with custom errors
 * export const NotificationErrors = defineErrors({
 *   PUSH_NOTIFICATIONS_DISABLED: {
 *     code: 'PUSH_NOTIFICATIONS_DISABLED',
 *     key: 'errors.notification.push_notifications_disabled',
 *     statusCode: 409,
 *   },
 * }
 * ApiErrorFactory.extend(NotificationErrors);
 *
 * @example
 * // Create error with default translation (based on current locale)
 * ApiErrorFactory.make('Validation.INVALID_EMAIL');
 *
 * @example
 * // Create error with custom message only
 * ApiErrorFactory.make('Validation.INVALID_EMAIL', {
 *   message: 'The provided email address is not formatted correctly.'
 * });
 *
 * @example
 * // Create error with custom message and debug details
 * ApiErrorFactory.make('Validation.INVALID_EMAIL', {
 *   message: 'Invalid email format',
 *   details: 'Received value: user@example',
 * });
 *
 * @example
 * // Create error with forced locale override (e.g., Spanish) and custom details
 * ApiErrorFactory.make('Validation.INVALID_EMAIL', {
 *   lng: 'es',
 *   message: 'Formato de correo electrónico inválido',
 *   details: 'Valor recibido: user@example',
 * });
 */
export class ApiErrorFactory {
  /**
   * Creates an API error instance from built-in error definitions
   *
   * @template {BuiltInKeys} K - Error key path type
   * @param {K} key - Dot-separated path to error definition (e.g., 'Validation.INVALID_EMAIL')
   * @param {ApiErrorFactoryOptions} [opts] - Configuration options
   * @returns {ApiError} Configured error instance
   * @throws {Error} When invalid key path is provided
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
   * Creates new error factory with merged error definitions
   *
   * @template {Record<string, RecursiveErrorTree>} Extra - Custom error definitions type
   * @param {Extra} extra - Custom error hierarchy to merge
   * @returns {ExtendedErrorFactory} New factory class with combined error definitions
   *
   * @example
   * // Create extended factory with deep error structure
   * const InventoryErrors = ApiErrorFactory.extend({
   *   Stock: {
   *     OutOfStock: {
   *       code: 'STOCK_EMPTY',
   *       statusCode: 409,
   *       key: 'errors.inventory.out_of_stock'
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
       * Creates error from merged definitions
       *
       * @template {Flatten<typeof mergedCodes>} K - Merged error key path type
       * @param {K} key - Dot-separated path in merged error hierarchy
       * @param {ApiErrorFactoryOptions} [opts] - Configuration options
       * @returns {ApiError} Configured error instance
       * @throws {Error} When invalid extended key path is provided
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
 * Type helper that generates dot-separated paths for error keys
 * @template T - Error tree type to flatten
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

/**
 * Union type of all valid built-in error paths
 * @typedef {Flatten<typeof ApiErrorCodes>} BuiltInKeys
 */
type BuiltInKeys = Flatten<typeof ApiErrorCodes>;

/**
 * Retrieves error definition from nested object structure
 * @private
 * @param {object} obj - Root error definition object
 * @param {string} path - Dot-separated key path
 * @returns {LocalizedApiError} Found error definition
 *
 * @example
 * const def = getErrorByPath(ApiErrorCodes, 'Validation.INVALID_EMAIL');
 */
function getErrorByPath(obj: object, path: string): LocalizedApiError {
  return path.split('.').reduce<any>((acc, key) => acc?.[key], obj);
}
