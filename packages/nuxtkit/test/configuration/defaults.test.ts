import { describe, expect, it } from 'vitest';

import { DEFAULT_OPTIONS } from '@/src/defaults';

describe('NuxtKit defaults', () => {
  it('uses NuxtKit-owned L10n keys and deterministic fallbacks', () => {
    expect(DEFAULT_OPTIONS.errors).toEqual({
      genericErrorKey: 'nuxtkit.error.generic',
      genericMessageFallback: 'Something went wrong',
      unauthorizedKey: 'nuxtkit.error.unauthorized',
      unauthorizedMessageFallback: 'Access denied.',
    });

    expect(DEFAULT_OPTIONS.zodI18n.keyPrefix).toBe('nuxtkit.zod');
  });
});
