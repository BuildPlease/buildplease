/**
 * @description Metadata attached to a localized API error message.
 */
export interface LocalizedApiError {
  /**
   * @description i18n key used for the public error message.
   */
  message: string;

  /**
   * @description Machine-readable error code.
   */
  code: string;

  /**
   * @description Associated HTTP status code.
   */
  statusCode: number;
}

/**
 * @description Recursive object structure for organizing API error definitions.
 */
export type RecursiveErrorTree = {
  [key: string]: RecursiveErrorTree | LocalizedApiError;
};

/**
 * @description Defines a validated, nested API error metadata tree.
 *
 * @template T Recursive tree where every leaf is a `LocalizedApiError`.
 * @param errors Nested error metadata tree.
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
export function defineErrors<T extends RecursiveErrorTree>(errors: T): T {
  assertErrorTree(errors);
  return errors;
}

// MARK: - Error Definitions

export const CommonErrors = defineErrors({
  NOT_FOUND: {
    message: 'errors.common.not_found',
    code: 'RESOURCE_NOT_FOUND',
    statusCode: 404,
  },
  UNKNOWN_ERROR: {
    message: 'errors.common.unknown_error',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  },
  UNABLE_TO_PROCESS_REQUEST: {
    message: 'errors.common.unable_to_process_request',
    code: 'UNABLE_TO_PROCESS_REQUEST',
    statusCode: 500,
  },
  RESOURCE_ALREADY_EXISTS: {
    message: 'errors.common.already_exists',
    code: 'RESOURCE_ALREADY_EXISTS',
    statusCode: 409,
  },
});

export const ServerErrors = defineErrors({
  INTERNAL_SERVER_ERROR: {
    message: 'errors.server.internal',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500,
  },
  SERVICE_UNAVAILABLE: {
    message: 'errors.server.unavailable',
    code: 'SERVICE_UNAVAILABLE',
    statusCode: 503,
  },
  DEPENDENCY_FAILED: {
    message: 'errors.server.dependency_failed',
    code: 'DEPENDENCY_FAILED',
    statusCode: 424,
  },
  TIMEOUT: {
    message: 'errors.server.timeout',
    code: 'TIMEOUT',
    statusCode: 504,
  },
});

export const LimitErrors = defineErrors({
  TOO_MANY_REQUESTS: {
    message: 'errors.limit.too_many_requests',
    code: 'TOO_MANY_REQUESTS',
    statusCode: 429,
  },
});

export const AuthorizationErrors = defineErrors({
  UNAUTHORIZED: {
    message: 'errors.auth.unauthorized',
    code: 'UNAUTHORIZED',
    statusCode: 401,
  },
  FORBIDDEN: {
    message: 'errors.auth.forbidden',
    code: 'FORBIDDEN',
    statusCode: 403,
  },
});

export const ValidationErrors = defineErrors({
  BAD_REQUEST: {
    message: 'errors.validation.bad_request',
    code: 'BAD_REQUEST',
    statusCode: 400,
  },
  INVALID_JSON_SYNTAX: {
    message: 'errors.validation.invalid_json_syntax',
    code: 'JSON_SYNTAX_ERROR',
    statusCode: 400,
  },
  INVALID_PROPERTIES: {
    message: 'errors.validation.invalid_properties',
    code: 'INVALID_PROPERTIES',
    statusCode: 400,
  },
  INVALID_FORMAT: {
    message: 'errors.validation.invalid_format',
    code: 'INVALID_FORMAT',
    statusCode: 400,
  },
  INVALID_DATE_FORMAT: {
    message: 'errors.validation.invalid_date_format',
    code: 'INVALID_DATE_FORMAT',
    statusCode: 400,
  },
  INVALID_PASSWORD: {
    message: 'errors.validation.invalid_password',
    code: 'INVALID_PASSWORD',
    statusCode: 403,
  },
  INVALID_PASSWORD_NEW_SAME_AS_OLD: {
    message: 'errors.validation.invalid_password_new_same_as_old',
    code: 'INVALID_PASSWORD_NEW_SAME_AS_OLD',
    statusCode: 409,
  },
  INVALID_PHONE_NUMBER_FORMAT: {
    message: 'errors.validation.invalid_phone_number_format',
    code: 'INVALID_PHONE_NUMBER_FORMAT',
    statusCode: 400,
  },
  INVALID_PHONE_NEW_SAME_AS_OLD: {
    message: 'errors.validation.invalid_phone_new_same_as_old',
    code: 'INVALID_PHONE_NEW_SAME_AS_OLD',
    statusCode: 409,
  },
  INVALID_EMAIL_FORMAT: {
    message: 'errors.validation.invalid_email_format',
    code: 'INVALID_EMAIL_FORMAT',
    statusCode: 400,
  },
  INVALID_EMAIL_NEW_SAME_AS_OLD: {
    message: 'errors.validation.invalid_email_new_same_as_old',
    code: 'INVALID_EMAIL_NEW_SAME_AS_OLD',
    statusCode: 409,
  },
});

export const FormatErrors = defineErrors({
  UNSUPPORTED_FORMAT: {
    message: 'errors.format.unsupported',
    code: 'UNSUPPORTED_FORMAT',
    statusCode: 400,
  },
  MAX_SIZE_EXCEEDED: {
    message: 'errors.format.max_size_exceeded',
    code: 'MAX_SIZE_EXCEEDED',
    statusCode: 413,
  },
});

export const ImageErrors = defineErrors({
  MAX_SIZE_EXCEEDED: {
    message: 'errors.image.max_size_exceeded',
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

function assertErrorTree(tree: RecursiveErrorTree): void {
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
