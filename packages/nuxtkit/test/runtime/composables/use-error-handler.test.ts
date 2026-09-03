import { CanceledError } from '@buildplease/core';
import { HttpError } from '@buildplease/webkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetNuxtKit, setNuxtKit } from '#test/mocks/internal-runtime';
import { resetNuxtApp, setNuxtApp } from '#test/mocks/nuxt-app';
import { useErrorHandler } from '@/src/runtime/composables/use-error-handler';

describe('useErrorHandler', () => {
  beforeEach(() => {
    resetNuxtApp();
    resetNuxtKit();

    setNuxtApp({
      $i18n: {
        te: () => false,
        t: (key) => key,
      },
    });

    setNuxtKit({
      logger: {
        error: vi.fn(),
      },
      debug: false,
      config: {
        errors: {
          genericErrorKey: 'nuxtkit.error.generic',
          genericMessageFallback: 'Something went wrong',
        },
      },
      isSSR: false,
      isClient: true,
      makeSymbol: (key) => Symbol.for(`test.nuxtkit.${key}`),
    });
  });

  it('returns a remote HTTP message when one is available', () => {
    const error = new HttpError({
      statusCode: 403,
      code: 'account_blocked',
      message: 'Account is blocked.',
    });

    expect(useErrorHandler(error)).toBe('Account is blocked.');
  });

  it('uses the configured fallback for an HTTP error without a message', () => {
    expect(useErrorHandler(new HttpError({ statusCode: 502 }))).toBe('Something went wrong');
  });

  it('uses the configured fallback for an HTTP error with a blank message', () => {
    expect(useErrorHandler(new HttpError({ statusCode: 500, message: '   ' }))).toBe('Something went wrong');
  });

  it('uses the configured fallback for non-HTTP errors', () => {
    expect(useErrorHandler(new Error('Technical error'))).toBe('Something went wrong');
  });

  it('suppresses canceled errors', () => {
    expect(useErrorHandler(new CanceledError())).toBeNull();
  });
});
