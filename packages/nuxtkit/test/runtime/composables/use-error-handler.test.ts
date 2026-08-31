import { CanceledError } from '@buildplease/core';
import { HttpError } from '@buildplease/webkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useErrorHandler } from '@/src/runtime/composables/use-error-handler';

const mocks = vi.hoisted(() => ({
  loggerError: vi.fn(),
  resolveI18nMessage: vi.fn(() => 'Generic error'),
}));

vi.mock('#internal-runtime', () => ({
  useNuxtKit: () => ({
    logger: {
      error: mocks.loggerError,
    },
    config: {
      errors: {
        genericErrorKey: 'nuxtkit.error.generic',
        genericMessageFallback: 'Something went wrong',
      },
    },
  }),
}));

vi.mock('#nuxtkit/i18n', () => ({
  resolveI18nMessage: mocks.resolveI18nMessage,
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    mocks.loggerError.mockClear();
    mocks.resolveI18nMessage.mockClear();
  });

  it('returns a remote HTTP message when one is available', () => {
    const error = new HttpError({
      statusCode: 403,
      code: 'account_blocked',
      message: 'Account is blocked.',
    });

    expect(useErrorHandler(error)).toBe('Account is blocked.');
    expect(mocks.resolveI18nMessage).not.toHaveBeenCalled();
  });

  it('uses the generic fallback for an HTTP error without a message', () => {
    const error = new HttpError({
      statusCode: 502,
    });

    expect(useErrorHandler(error)).toBe('Generic error');
    expect(mocks.resolveI18nMessage).toHaveBeenCalledTimes(1);
  });

  it('uses the generic fallback for an HTTP error with a blank message', () => {
    const error = new HttpError({
      statusCode: 500,
      message: '   ',
    });

    expect(useErrorHandler(error)).toBe('Generic error');
    expect(mocks.resolveI18nMessage).toHaveBeenCalledTimes(1);
  });

  it('uses the generic fallback for non-HTTP errors', () => {
    expect(useErrorHandler(new Error('Technical error'))).toBe('Generic error');
    expect(mocks.resolveI18nMessage).toHaveBeenCalledTimes(1);
  });

  it('suppresses canceled errors', () => {
    expect(useErrorHandler(new CanceledError())).toBeNull();
    expect(mocks.resolveI18nMessage).not.toHaveBeenCalled();
  });
});
