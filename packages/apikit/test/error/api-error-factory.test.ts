import { TestErrorFactory } from '@test/fixtures/error/api-error-factory';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/error/api-error';
import { ApiErrorCodes, defineErrors } from '@/error/api-error-codes';
import { ApiErrorFactory } from '@/error/api-error-factory';

describe('ApiErrorFactory', () => {
  it('creates built-in API errors from typed paths', () => {
    const error = ApiErrorFactory.make('Validation.BAD_REQUEST', {
      overrideMessage: 'Bad request.',
      details: 'Invalid payload.',
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request.');
    expect(error.toJSON()).toEqual({
      code: 'BAD_REQUEST',
      message: 'Bad request.',
      details: { _error: ['Invalid payload.'] },
    });
  });

  it('creates extended API errors from typed paths', () => {
    const error = TestErrorFactory.make('Account.NOT_FOUND', {
      overrideMessage: 'Account not found.',
    });

    expect(error.code).toBe('account_not_found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Account not found.');
  });

  it('rejects invalid API error paths at runtime', () => {
    expect(() => ApiErrorFactory.make('Validation.DOES_NOT_EXIST' as never)).toThrow(
      'Invalid API error code path: Validation.DOES_NOT_EXIST',
    );
  });

  it('rejects duplicate API error message keys when extending factories', () => {
    const duplicateErrors = defineErrors({
      Account: {
        NOT_FOUND: {
          code: 'account_not_found',
          message: ApiErrorCodes.Common.NOT_FOUND.message,
          statusCode: 404,
        },
      },
    });

    expect(() => ApiErrorFactory.extend(duplicateErrors)).toThrow(
      `Duplicate API error message key: ${ApiErrorCodes.Common.NOT_FOUND.message}`,
    );
  });
});
