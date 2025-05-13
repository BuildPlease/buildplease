/**
 * Registers a validated, nested error definition tree.
 *
 * @template T - A recursive tree where each leaf is a `LocalizedApiError`.
 * @param errors - The nested error structure to define.
 * @returns The validated error structure, typed for later lookup.
 */
export function defineErrors<T extends RecursiveErrorTree>(errors: T): T {
  return errors;
}

export interface LocalizedApiError {
  /** A machine-readable error code. */
  code: string;
  /** A translation key used for localization. */
  key: string;
  /** The associated HTTP status code. */
  statusCode: number;
}

/**
 * A recursive object structure for organizing nested error definitions.
 * Leaf nodes must be valid `LocalizedApiError` objects.
 */
type RecursiveErrorTree = {
  [key: string]: RecursiveErrorTree | LocalizedApiError;
};

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

// --- Runtime Error Definitions ---

export const CommonErrors = defineErrors({
  NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    key: 'errors.common.not_found',
    statusCode: 404,
  },
  RESOURCE_ALREADY_EXISTS: {
    code: 'RESOURCE_ALREADY_EXISTS',
    key: 'errors.common.already_exists',
    statusCode: 409,
  },
});

export const ServerErrors = defineErrors({
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    key: 'errors.server.internal',
    statusCode: 500,
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    key: 'errors.server.unavailable',
    statusCode: 503,
  },
  DEPENDENCY_FAILED: {
    code: 'DEPENDENCY_FAILED',
    key: 'errors.server.dependency_failed',
    statusCode: 424,
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    key: 'errors.server.timeout',
    statusCode: 504,
  },
});

export const LimitErrors = defineErrors({
  TOO_MANY_REQUESTS: {
    code: 'TOO_MANY_REQUESTS',
    key: 'errors.limit.too_many_requests',
    statusCode: 429,
  },
});

export const AuthorizationErrors = defineErrors({
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    key: 'errors.auth.unauthorized',
    statusCode: 401,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    key: 'errors.auth.forbidden',
    statusCode: 403,
  },
});

export const ValidationErrors = defineErrors({
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    key: 'errors.validation.bad_request',
    statusCode: 400,
  },
  INVALID_JSON_SYNTAX: {
    code: 'JSON_SYNTAX_ERROR',
    key: 'errors.validation.invalid_json_syntax',
    statusCode: 400,
  },
  INVALID_PROPERTIES: {
    code: 'INVALID_PROPERTIES',
    key: 'errors.validation.invalid_properties',
    statusCode: 400,
  },
  INVALID_FORMAT: {
    code: 'INVALID_FORMAT',
    key: 'errors.validation.invalid_format',
    statusCode: 400,
  },
  INVALID_DATE_FORMAT: {
    code: 'INVALID_DATE_FORMAT',
    key: 'errors.validation.invalid_date_format',
    statusCode: 400,
  },
  INVALID_PASSWORD: {
    code: 'INVALID_PASSWORD',
    key: 'errors.validation.invalid_password',
    statusCode: 403,
  },
  INVALID_PASSWORD_NEW_SAME_AS_OLD: {
    code: 'INVALID_PASSWORD_NEW_SAME_AS_OLD',
    key: 'errors.validation.invalid_password_new_same_as_old',
    statusCode: 409,
  },
  INVALID_PHONE_NUMBER_FORMAT: {
    code: 'INVALID_PHONE_NUMBER_FORMAT',
    key: 'errors.validation.invalid_phone_number_format',
    statusCode: 400,
  },
  INVALID_PHONE_NEW_SAME_AS_OLD: {
    code: 'INVALID_PHONE_NEW_SAME_AS_OLD',
    key: 'errors.validation.invalid_phone_new_same_as_old',
    statusCode: 409,
  },
  INVALID_EMAIL_FORMAT: {
    code: 'INVALID_EMAIL_FORMAT',
    key: 'errors.validation.invalid_email_format',
    statusCode: 400,
  },
  INVALID_EMAIL_NEW_SAME_AS_OLD: {
    code: 'INVALID_EMAIL_NEW_SAME_AS_OLD',
    key: 'errors.validation.invalid_email_new_same_as_old',
    statusCode: 409,
  },
});

export const ApiErrorCodes = {
  Common: CommonErrors,
  Server: ServerErrors,
  Limit: LimitErrors,
  Authorization: AuthorizationErrors,
  Validation: ValidationErrors,
} as const;

/**
 * All valid error keys derived from the nested error tree.
 * Used for autocomplete and compile-time safety.
 *
 * @example
 * 'Validation.INVALID_EMAIL_FORMAT'
 * 'Server.TIMEOUT'
 */
export type AllErrorKeys = Flatten<typeof ApiErrorCodes>;

/**
 * Resolves the full `LocalizedApiError` type for a given dot-notation key.
 *
 * @template K - A valid key from `AllErrorKeys`.
 * @example
 * ErrorByKey<'Validation.INVALID_FORMAT'> -> { code, key, statusCode }
 */
export type ErrorByKey<K extends AllErrorKeys> = ValueAtPath<typeof ApiErrorCodes, K>;
