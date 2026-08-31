import type { ScopeController } from '@buildplease/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInstance } from '@/src/runtime/composables/use-instance';
import { useScopeController } from '@/src/runtime/composables/use-scope-controller';

const mocks = vi.hoisted(() => ({
  nuxtApp: {} as { $scopeController?: ScopeController },
}));

vi.mock('#app', () => ({
  useNuxtApp: () => mocks.nuxtApp,
}));

describe('Scope composables', () => {
  beforeEach(() => {
    mocks.nuxtApp = {};
  });

  it('consumes the scope controller supplied by the application', () => {
    const scope = {
      getInstance: vi.fn(),
    } as unknown as ScopeController;

    mocks.nuxtApp = { $scopeController: scope };

    expect(useScopeController()).toBe(scope);
  });

  it('resolves instances from the application-owned scope', () => {
    const symbol = Symbol('service');
    const instance = { value: 'resolved' };
    const getInstance = vi.fn(() => instance);

    mocks.nuxtApp = {
      $scopeController: { getInstance: getInstance } as unknown as ScopeController,
    };

    expect(useInstance<typeof instance>(symbol)).toBe(instance);
    expect(getInstance).toHaveBeenCalledWith(symbol);
  });

  it('fails clearly when the application has not provided a scope', () => {
    expect(() => useScopeController()).toThrow(
      'Scope controller is not available. Provide it from an application plugin.',
    );
  });
});
