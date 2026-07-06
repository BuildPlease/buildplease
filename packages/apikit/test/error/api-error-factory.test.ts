import { TestErrorFactory } from '@test/fixtures/error/api-error-factory';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/error/api-error';
import { ApiErrorCodes } from '@/error/api-error-codes';
import { ApiErrorFactory } from '@/error/api-error-factory';

describe('ApiErrorFactory', () => {
  it('creates built-in API errors', () => {
    const error = ApiErrorFactory.make(ApiErrorCodes.Validation.BAD_REQUEST.message, {
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

  it('creates extended API errors', () => {
    const error = TestErrorFactory.make('errors.account.not_found', {
      overrideMessage: 'Account not found.',
    });

    expect(error.code).toBe('account_not_found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Account not found.');
  });

  it('rejects invalid error keys', () => {
    expect(() => ApiErrorFactory.make('errors.validation.unknown')).toThrow(
      'Invalid error message key: errors.validation.unknown',
    );
    expect(() => TestErrorFactory.make('errors.account.unknown')).toThrow(
      'Invalid error message key: errors.account.unknown',
    );
  });
});
