import { describe, expect, it } from 'vitest';

import { ApiError } from '@/error/api-error';
import { ApiErrorFactory } from '@/error/api-error-factory';

import { TestErrorFactory } from './fixtures';

describe('ApiErrorFactory', () => {
  it('creates built-in API errors', () => {
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

  it('creates extended API errors', () => {
    const error = TestErrorFactory.make('Account.NOT_FOUND', {
      overrideMessage: 'Account not found.',
    });

    expect(error.code).toBe('account_not_found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Account not found.');
  });

  it('rejects invalid error keys', () => {
    expect(() => ApiErrorFactory.make('Validation.UNKNOWN' as never)).toThrow('Invalid error key: Validation.UNKNOWN');
    expect(() => TestErrorFactory.make('Account.UNKNOWN' as never)).toThrow(
      'Invalid extended error key: Account.UNKNOWN',
    );
  });
});
