import { DEFAULT_OPTIONS } from '@/src/defaults';
import { describe, expect, it } from 'vitest';

describe('NuxtKit defaults', () => {
  it('uses NuxtKit-owned L10n keys and deterministic fallbacks', () => {
    expect(DEFAULT_OPTIONS.errors).toEqual({
      genericErrorKey: 'nuxtkit.error.generic',
      genericMessageFallback: 'Something went wrong',
    });

    expect(DEFAULT_OPTIONS.zodI18n.keyPrefix).toBe('nuxtkit.zod');
  });
});
