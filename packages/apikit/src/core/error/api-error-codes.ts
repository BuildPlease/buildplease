import type { ApiErrorProperties } from '#/error';
import { ApiError } from '#/error';

export function makeError(properties: ApiErrorProperties) {
  return (message?: string) =>
    new ApiError({
      ...properties,
      message: message ?? properties.message,
    });
}

export const CommonErrors = {
  NOT_FOUND: makeError({
    identifier: 'RESOURCE_NOT_FOUND',
    message: 'Resource could not be found.',
    statusCode: 404,
  }),
  RESOURCE_ALREADY_EXISTS: makeError({
    identifier: 'RESOURCE_ALREADY_EXISTS',
    message: 'Resource already exists.',
    statusCode: 409,
  }),
};

export const ServerErrors = {
  INTERNAL_SERVER_ERROR: makeError({
    identifier: 'INTERNAL_SERVER_ERROR',
    message: 'An internal server error has occurred.',
    statusCode: 500,
  }),
  SERVICE_UNAVAILABLE: makeError({
    identifier: 'SERVICE_UNAVAILABLE',
    message: 'The service is temporarily unavailable. Please try again later.',
    statusCode: 503,
  }),
  DEPENDENCY_FAILED: makeError({
    identifier: 'DEPENDENCY_FAILED',
    message: 'A required dependency failed.',
    statusCode: 424,
  }),
  TIMEOUT: makeError({
    identifier: 'TIMEOUT',
    message: 'The server timed out waiting for the request.',
    statusCode: 504,
  }),
};

export const LimitErrors = {
  TOO_MANY_REQUESTS: makeError({
    identifier: 'TOO_MANY_REQUESTS',
    message: 'Rate limit exceeded',
    statusCode: 429,
  }),
};

export const AuthorizationErrors = {
  UNAUTHORIZED: makeError({
    identifier: 'UNAUTHORIZED',
    message: 'You are not authorized to perform this action.',
    statusCode: 401,
  }),
  FORBIDDEN: makeError({
    identifier: 'FORBIDDEN',
    message: 'You do not have permission to access this resource.',
    statusCode: 403,
  }),
};

export const ValidationErrors = {
  INVALID_JSON_SYNTAX: makeError({
    identifier: 'JSON_SYNTAX_ERROR',
    message: 'The JSON format is invalid.',
    statusCode: 400,
  }),
  INVALID_PROPERTIES: makeError({
    identifier: 'INVALID_PROPERTIES',
    message: 'The provided properties are invalid.',
    statusCode: 400,
  }),
  INVALID_FORMAT: makeError({
    identifier: 'INVALID_FORMAT',
    message: 'The format is invalid.',
    statusCode: 400,
  }),
  INVALID_DATE_FORMAT: makeError({
    identifier: 'INVALID_DATE_FORMAT',
    message: 'The date format is invalid.',
    statusCode: 400,
  }),
  INVALID_PASSWORD: makeError({
    identifier: 'INVALID_PASSWORD',
    message: 'The password is incorrect.',
    statusCode: 403,
  }),
  INVALID_PASSWORD_NEW_SAME_AS_OLD: makeError({
    identifier: 'INVALID_PASSWORD_NEW_SAME_AS_OLD',
    message: 'The new password must be different from the current password.',
    statusCode: 409,
  }),
  INVALID_PHONE_NUMBER_FORMAT: makeError({
    identifier: 'INVALID_PHONE_NUMBER_FORMAT',
    message: 'The phone number format is invalid.',
    statusCode: 400,
  }),
  INVALID_PHONE_NEW_SAME_AS_OLD: makeError({
    identifier: 'INVALID_PHONE_NEW_SAME_AS_OLD',
    message:
      'The new phone number must be different from the old phone number.',
    statusCode: 409,
  }),
  INVALID_EMAIL_FORMAT: makeError({
    identifier: 'INVALID_EMAIL_FORMAT',
    message: 'The email format is invalid.',
    statusCode: 400,
  }),
  INVALID_EMAIL_NEW_SAME_AS_OLD: makeError({
    identifier: 'INVALID_EMAIL_NEW_SAME_AS_OLD',
    message: 'The new email must be different from the old email.',
    statusCode: 409,
  }),
};

export const ApiErrorCodes = {
  Common: CommonErrors,
  Server: ServerErrors,
  Limit: LimitErrors,
  Authorization: AuthorizationErrors,
  Validation: ValidationErrors,
};
