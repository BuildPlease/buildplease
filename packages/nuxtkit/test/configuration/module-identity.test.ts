import { describe, expect, it } from 'vitest';

import {
  MODULE_CONFIG_KEY_NAME,
  MODULE_NAME,
  MODULE_PACKAGE_NAME,
  MODULE_SYMBOL_NAME,
} from '@/src/internal-shared/constants';

describe('NuxtKit module identity', () => {
  it('derives framework-facing identities consistently', () => {
    expect(MODULE_NAME).toBe('NuxtKit');
    expect(MODULE_PACKAGE_NAME).toBe('@buildplease/nuxtkit');
    expect(MODULE_SYMBOL_NAME).toBe('buildplease.NuxtKit');
    expect(MODULE_CONFIG_KEY_NAME).toBe('nuxtkit');
  });
});
