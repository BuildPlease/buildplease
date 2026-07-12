import { I18n } from '@i18n/index';

import { type ApiErrorDefinition, type ApiErrorTree, isApiErrorDefinition } from './api-error-definition';

/**
 * @description Defines a validated, nested API error metadata tree.
 *
 * @template T Recursive tree where every leaf is an `ApiErrorDefinition`.
 * @param errors Nested API error metadata tree.
 * @returns The same tree, typed for later reuse.
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
 * ```
 */
export function defineErrors<T extends ApiErrorTree>(errors: T): T {
  assertApiErrorTree(errors);
  return errors;
}

// MARK: - Error Definitions

export const CommonErrors = defineErrors({
  NOT_FOUND: {
    message: I18n.Errors.Common.NotFound,
    code: 'RESOURCE_NOT_FOUND',
    statusCode: 404,
  },
  UNKNOWN_ERROR: {
    message: I18n.Errors.Common.UnknownError,
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  },
  UNABLE_TO_PROCESS_REQUEST: {
    message: I18n.Errors.Common.UnableToProcessRequest,
    code: 'UNABLE_TO_PROCESS_REQUEST',
    statusCode: 500,
  },
  RESOURCE_ALREADY_EXISTS: {
    message: I18n.Errors.Common.AlreadyExists,
    code: 'RESOURCE_ALREADY_EXISTS',
    statusCode: 409,
  },
});

export const ServerErrors = defineErrors({
  INTERNAL_SERVER_ERROR: {
    message: I18n.Errors.Server.Internal,
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  },
  SERVICE_UNAVAILABLE: {
    message: I18n.Errors.Server.Unavailable,
    code: 'SERVICE_UNAVAILABLE',
    statusCode: 503,
  },
  DEPENDENCY_FAILED: {
    message: I18n.Errors.Server.DependencyFailed,
    code: 'DEPENDENCY_FAILED',
    statusCode: 424,
  },
  TIMEOUT: {
    message: I18n.Errors.Server.Timeout,
    code: 'TIMEOUT',
    statusCode: 504,
  },
});

export const LimitErrors = defineErrors({
  TOO_MANY_REQUESTS: {
    message: I18n.Errors.Limit.TooManyRequests,
    code: 'TOO_MANY_REQUESTS',
    statusCode: 429,
  },
});

export const AuthorizationErrors = defineErrors({
  UNAUTHORIZED: {
    message: I18n.Errors.Auth.Unauthorized,
    code: 'UNAUTHORIZED',
    statusCode: 401,
  },
  FORBIDDEN: {
    message: I18n.Errors.Auth.Forbidden,
    code: 'FORBIDDEN',
    statusCode: 403,
  },
});

export const ValidationErrors = defineErrors({
  BAD_REQUEST: {
    message: I18n.Errors.Validation.BadRequest,
    code: 'BAD_REQUEST',
    statusCode: 400,
  },
  INVALID_JSON_SYNTAX: {
    message: I18n.Errors.Validation.InvalidJsonSyntax,
    code: 'JSON_SYNTAX_ERROR',
    statusCode: 400,
  },
  INVALID_PROPERTIES: {
    message: I18n.Errors.Validation.InvalidProperties,
    code: 'INVALID_PROPERTIES',
    statusCode: 400,
  },
  INVALID_FORMAT: {
    message: I18n.Errors.Validation.InvalidFormat,
    code: 'INVALID_FORMAT',
    statusCode: 400,
  },
  INVALID_DATE_FORMAT: {
    message: I18n.Errors.Validation.InvalidDateFormat,
    code: 'INVALID_DATE_FORMAT',
    statusCode: 400,
  },
  INVALID_PASSWORD: {
    message: I18n.Errors.Validation.InvalidPassword,
    code: 'INVALID_PASSWORD',
    statusCode: 403,
  },
  INVALID_PASSWORD_NEW_SAME_AS_OLD: {
    message: I18n.Errors.Validation.InvalidPasswordNewSameAsOld,
    code: 'INVALID_PASSWORD_NEW_SAME_AS_OLD',
    statusCode: 409,
  },
  INVALID_PHONE_NUMBER_FORMAT: {
    message: I18n.Errors.Validation.InvalidPhoneNumberFormat,
    code: 'INVALID_PHONE_NUMBER_FORMAT',
    statusCode: 400,
  },
  INVALID_PHONE_NEW_SAME_AS_OLD: {
    message: I18n.Errors.Validation.InvalidPhoneNewSameAsOld,
    code: 'INVALID_PHONE_NEW_SAME_AS_OLD',
    statusCode: 409,
  },
  INVALID_EMAIL_FORMAT: {
    message: I18n.Errors.Validation.InvalidEmailFormat,
    code: 'INVALID_EMAIL_FORMAT',
    statusCode: 400,
  },
  INVALID_EMAIL_NEW_SAME_AS_OLD: {
    message: I18n.Errors.Validation.InvalidEmailNewSameAsOld,
    code: 'INVALID_EMAIL_NEW_SAME_AS_OLD',
    statusCode: 409,
  },
});

export const FormatErrors = defineErrors({
  UNSUPPORTED_FORMAT: {
    message: I18n.Errors.Format.Unsupported,
    code: 'UNSUPPORTED_FORMAT',
    statusCode: 400,
  },
  MAX_SIZE_EXCEEDED: {
    message: I18n.Errors.Format.MaxSizeExceeded,
    code: 'MAX_SIZE_EXCEEDED',
    statusCode: 413,
  },
});

export const ImageErrors = defineErrors({
  MAX_SIZE_EXCEEDED: {
    message: I18n.Errors.Image.MaxSizeExceeded,
    code: 'IMAGE_MAX_SIZE_EXCEEDED',
    statusCode: 413,
  },
});

export const ApiErrorCodes = defineErrors({
  Common: CommonErrors,
  Server: ServerErrors,
  Limit: LimitErrors,
  Authorization: AuthorizationErrors,
  Validation: ValidationErrors,
  Format: FormatErrors,
  Image: ImageErrors,
} as const);

// MARK: - Private

function assertApiErrorTree(tree: ApiErrorTree): void {
  const messages = new Set<string>();

  visitApiErrorTree(tree, (error) => {
    if (messages.has(error.message)) {
      throw new Error(`Duplicate API error message key: ${error.message}`);
    }

    messages.add(error.message);
  });
}

function visitApiErrorTree(tree: ApiErrorTree, visitor: (error: ApiErrorDefinition) => void): void {
  for (const value of Object.values(tree)) {
    if (isApiErrorDefinition(value)) {
      visitor(value);
      continue;
    }

    visitApiErrorTree(value, visitor);
  }
}
