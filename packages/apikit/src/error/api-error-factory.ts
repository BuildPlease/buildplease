import merge from 'lodash.merge';

import { type I18nOptions, I18nFactory } from '@/i18n';

import { type ApiErrorDetails, ApiError } from './api-error';
import { ApiErrorCodes, defineErrors } from './api-error-codes';
import {
  type ApiErrorDefinition,
  type ApiErrorPath,
  type ApiErrorTree,
  isApiErrorDefinition,
} from './api-error-definition';

/**
 * @description Options for creating a localized API error.
 */
export interface ApiErrorFactoryOptions {
  /**
   * @description Explicit message override returned instead of resolving the error L10n key.
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
 * @description Factory API for creating standardized, localized API errors.
 */
export interface ApiErrorFactory<TCodes extends ApiErrorTree> {
  /**
   * @description Error metadata tree owned by this factory.
   */
  readonly codes: TCodes;

  /**
   * @description Creates an API error from a typed path in this factory's error tree.
   *
   * @param path Dot-separated path to an error definition, for example `Validation.BAD_REQUEST`.
   * @param options Optional message override, details, or i18next options.
   * @returns Configured `ApiError` instance.
   */
  make(path: ApiErrorPath<TCodes>, options?: ApiErrorFactoryOptions): ApiError;

  /**
   * @description Creates a new factory with custom error metadata merged over this factory.
   *
   * @param extra Custom error metadata tree.
   * @returns Factory with merged error metadata.
   */
  extend<TExtra extends ApiErrorTree>(extra: TExtra): ApiErrorFactory<TCodes & TExtra>;
}

/**
 * @description Factory for creating standardized, localized API errors.
 *
 * @example
 * ```ts
 * throw ApiErrorFactory.make('Validation.BAD_REQUEST');
 * ```
 *
 * @example
 * ```ts
 * export const AccountErrors = defineErrors({
 *   BLOCKED: {
 *     message: L10n.Errors.Account.Blocked,
 *     code: 'account_blocked',
 *     statusCode: 403,
 *   },
 * });
 *
 * export const ErrorFactory = ApiErrorFactory.extend({ Account: AccountErrors });
 * throw ErrorFactory.make('Account.BLOCKED');
 * ```
 */
export const ApiErrorFactory = makeApiErrorFactory(ApiErrorCodes);

// MARK: - Private Implementation

function makeApiErrorFactory<TCodes extends ApiErrorTree>(codes: TCodes): ApiErrorFactory<TCodes> {
  return {
    codes: codes,

    make(path: ApiErrorPath<TCodes>, options: ApiErrorFactoryOptions = {}): ApiError {
      const error = getApiErrorByPath(codes, path);
      if (!error) throw new Error(`Invalid API error code path: ${path}`);

      return makeApiError(error, options);
    },

    extend<TExtra extends ApiErrorTree>(extra: TExtra): ApiErrorFactory<TCodes & TExtra> {
      const mergedCodes = merge({}, codes, extra) as TCodes & TExtra;
      defineErrors(mergedCodes);

      return makeApiErrorFactory(mergedCodes);
    },
  };
}

function makeApiError(error: ApiErrorDefinition, options: ApiErrorFactoryOptions): ApiError {
  const { overrideMessage, details, i18n } = options;
  const message = I18nFactory.translateKey(error.message, { overrideMessage, i18n });

  return new ApiError({
    code: error.code,
    statusCode: error.statusCode,
    message: message,
    details: details,
  });
}

function getApiErrorByPath(tree: ApiErrorTree, path: string): ApiErrorDefinition | undefined {
  const parts = path.split('.');
  let current: ApiErrorTree | ApiErrorDefinition | undefined = tree;

  for (const part of parts) {
    if (!current || isApiErrorDefinition(current)) return undefined;

    const next: ApiErrorTree | ApiErrorDefinition | undefined = current[part];
    current = next;
  }

  if (!current || !isApiErrorDefinition(current)) return undefined;

  return current;
}
