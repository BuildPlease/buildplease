import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { z } from 'zod';

import { resetNuxtKit, setNuxtKit } from '#test/mocks/internal-runtime';

import enMessages from '@/src/runtime/l10n/locales/en.json';
import { makeErrorMap } from '@/src/runtime/zod/shared/make-error-map';

const DEFAULT_LOCALE = 'en';

function configureNuxtKit(): void {
  setNuxtKit({
    logger: {
      error: vi.fn(),
    },
    debug: false,
    config: {
      zodI18n: {
        keyPrefix: 'nuxtkit.zod',
      },
      errors: {
        genericErrorKey: 'nuxtkit.error.generic',
        genericMessageFallback: 'Something went wrong',
      },
    },
    isSSR: false,
    isClient: true,
    makeSymbol: (key) => Symbol.for(`test.nuxtkit.${key}`),
  });
}

function configureZod(): void {
  const i18n = createI18n({
    legacy: false,
    locale: DEFAULT_LOCALE,
    messages: {
      [DEFAULT_LOCALE]: enMessages,
    },
  });

  z.config({ localeError: makeErrorMap(i18n.global) });
}

describe('makeErrorMap', () => {
  beforeEach(() => {
    resetNuxtKit();
    configureNuxtKit();
    configureZod();
  });

  it('maps custom issues to the generic invalid message', () => {
    const result = z.custom(() => false).safeParse('value');

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]?.message).toBe('Invalid value.');
  });

  it('maps an empty required string to the generic empty message', () => {
    const result = z.string().min(1).safeParse('');

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]?.message).toBe('Cannot be empty.');
  });
});
