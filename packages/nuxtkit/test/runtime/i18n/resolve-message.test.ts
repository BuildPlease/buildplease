import { describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';

import { DEFAULT_OPTIONS } from '@/src/defaults';
import { resolveI18nMessage } from '@/src/runtime/i18n/resolve-message';

const DEFAULT_LOCALE = 'en';
const enMessages = {
  nuxtkit: {
    error: {
      generic: 'Something went wrong',
      unauthorized: 'Access denied.',
    },
  },
};

describe('resolveI18nMessage', () => {
  it('resolves the built-in NuxtKit translation', () => {
    const i18n = createI18n({
      legacy: false,
      locale: DEFAULT_LOCALE,
      messages: {
        [DEFAULT_LOCALE]: enMessages,
      },
    });

    const message = resolveI18nMessage(
      i18n.global,
      DEFAULT_OPTIONS.errors.genericErrorKey,
      DEFAULT_OPTIONS.errors.genericMessageFallback,
    );

    expect(message).toBe('Something went wrong');
  });

  it('lets the consumer override a built-in NuxtKit translation', () => {
    const i18n = createI18n({
      legacy: false,
      locale: DEFAULT_LOCALE,
      messages: {
        [DEFAULT_LOCALE]: enMessages,
      },
    });

    i18n.global.mergeLocaleMessage(DEFAULT_LOCALE, {
      nuxtkit: {
        error: {
          generic: 'Consumer error message',
        },
      },
    });

    const message = resolveI18nMessage(
      i18n.global,
      DEFAULT_OPTIONS.errors.genericErrorKey,
      DEFAULT_OPTIONS.errors.genericMessageFallback,
    );

    expect(message).toBe('Consumer error message');
  });

  it('resolves a configured consumer i18n key', () => {
    const i18n = createI18n({
      legacy: false,
      locale: DEFAULT_LOCALE,
      messages: {
        [DEFAULT_LOCALE]: {
          application: {
            error: {
              generic: 'Application error message',
            },
          },
        },
      },
    });

    const message = resolveI18nMessage(i18n.global, 'application.error.generic', 'Fallback');

    expect(message).toBe('Application error message');
  });

  it('uses a configured literal fallback when the key is missing', () => {
    const i18n = createI18n({
      legacy: false,
      locale: DEFAULT_LOCALE,
      messages: {
        [DEFAULT_LOCALE]: {},
      },
    });

    const message = resolveI18nMessage(i18n.global, 'application.error.missing', 'Custom fallback');

    expect(message).toBe('Custom fallback');
  });

  it('uses the NuxtKit default fallback when the default key is missing', () => {
    const i18n = createI18n({
      legacy: false,
      locale: DEFAULT_LOCALE,
      messages: {
        [DEFAULT_LOCALE]: {},
      },
    });

    const message = resolveI18nMessage(
      i18n.global,
      DEFAULT_OPTIONS.errors.genericErrorKey,
      DEFAULT_OPTIONS.errors.genericMessageFallback,
    );

    expect(message).toBe('Something went wrong');
  });
});
