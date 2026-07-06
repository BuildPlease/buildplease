import merge from 'lodash.merge';

import { type I18nOptions, I18nFactory } from '@/i18n';

import { type ApiErrorDetails, ApiError } from './api-error';
import { type LocalizedApiError, type RecursiveErrorTree, ApiErrorCodes } from './api-error-codes';

/**
 * @description Options for creating a localized API error.
 */
export interface ApiErrorFactoryOptions {
  /**
   * @description Explicit message override returned instead of resolving the error i18n key.
   * @default null
   */
  overrideMessage?: string | null;

  /**
   * @description Technical details returned in the API error payload.
   * @default undefined
   */
  details?: ApiErrorDetails;

  /**
   * @description i18next options passed to the active i18n provider.
   * @default undefined
   */
  i18n?: I18nOptions;
}

/**
 * @description Factory for creating standardized, localized API errors.
 *
 * @example
 * ```ts
 * throw ApiErrorFactory.make(I18n.Errors.Validation.BadRequest);
 * ```
 *
 * @example
 * ```ts
 * export const AccountErrors = defineErrors({
 *   BLOCKED: {
 *     message: I18n.Errors.Account.Blocked,
 *     code: 'account_blocked',
 *     statusCode: 403,
 *   },
 * });
 *
 * export const ErrorFactory = ApiErrorFactory.extend({ Account: AccountErrors });
 * ```
 */
export class ApiErrorFactory {
  /**
   * @description Error metadata tree owned by this factory.
   */
  public static readonly codes: RecursiveErrorTree = ApiErrorCodes;

  /**
   * @description Creates an API error from an i18n error message key.
   *
   * @param message Generated i18n error key, usually from `.apikit/i18n.ts`.
   * @param options Optional message override, details, or i18next options.
   * @returns Configured `ApiError` instance.
   *
   * @throws Error when the message key has no API error metadata.
   *
   * @example
   * ```ts
   * ApiErrorFactory.make(I18n.Errors.Common.NotFound);
   * ```
   */
  public static make(message: string, options: ApiErrorFactoryOptions = {}): ApiError {
    const error = getErrorByMessage(this.codes, message);
    if (!error) throw new Error(`Invalid error message key: ${message}`);

    return makeApiError(error, options);
  }

  /**
   * @description Creates a new factory with custom error metadata merged over this factory.
   *
   * @param extra Custom error metadata tree.
   * @returns A factory class with merged error metadata.
   *
   * @example
   * ```ts
   * export const ErrorFactory = ApiErrorFactory.extend({
   *   Account: AccountErrors,
   * });
   * ```
   */
  public static extend(extra: RecursiveErrorTree): typeof ApiErrorFactory {
    const mergedCodes = merge({}, this.codes, extra) as RecursiveErrorTree;
    assertNoDuplicateMessages(mergedCodes);

    return class ExtendedApiErrorFactory extends ApiErrorFactory {
      public static override readonly codes: RecursiveErrorTree = mergedCodes;
    };
  }
}

// MARK: - Private Implementation

function makeApiError(error: LocalizedApiError, options: ApiErrorFactoryOptions): ApiError {
  const { overrideMessage, details, i18n } = options;
  const message = I18nFactory.translateKey(error.message, { overrideMessage, i18n });

  return new ApiError({
    code: error.code,
    statusCode: error.statusCode,
    message: message,
    details: details,
  });
}

function getErrorByMessage(tree: RecursiveErrorTree, message: string): LocalizedApiError | undefined {
  for (const value of Object.values(tree)) {
    if (isLocalizedApiError(value)) {
      if (value.message === message) return value;
      continue;
    }

    const nested = getErrorByMessage(value, message);
    if (nested) return nested;
  }

  return undefined;
}

function assertNoDuplicateMessages(tree: RecursiveErrorTree): void {
  const messages = new Set<string>();

  visitErrorTree(tree, (error) => {
    if (messages.has(error.message)) {
      throw new Error(`Duplicate API error message key: ${error.message}`);
    }

    messages.add(error.message);
  });
}

function visitErrorTree(tree: RecursiveErrorTree, visitor: (error: LocalizedApiError) => void): void {
  for (const value of Object.values(tree)) {
    if (isLocalizedApiError(value)) {
      visitor(value);
      continue;
    }

    visitErrorTree(value, visitor);
  }
}

function isLocalizedApiError(value: RecursiveErrorTree | LocalizedApiError): value is LocalizedApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string' &&
    'code' in value &&
    typeof value.code === 'string' &&
    'statusCode' in value &&
    typeof value.statusCode === 'number'
  );
}
