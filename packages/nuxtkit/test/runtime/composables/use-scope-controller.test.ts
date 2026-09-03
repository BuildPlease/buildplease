import { ScopeController } from '@buildplease/core';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetNuxtApp, setNuxtApp } from '#test/mocks/nuxt-app';
import { useInstance } from '@/src/runtime/composables/use-instance';
import { useScopeController } from '@/src/runtime/composables/use-scope-controller';

describe('Scope composables', () => {
  beforeEach(() => {
    resetNuxtApp();
  });

  it('consumes the scope controller supplied by the application', () => {
    const scope = new ScopeController();
    setNuxtApp({ $scopeController: scope });

    expect(useScopeController()).toBe(scope);
  });

  it('resolves instances from the application-owned scope', () => {
    const symbol = Symbol('service');
    const instance = { value: 'resolved' };
    const scope = new ScopeController();
    scope.container.bind(symbol).toConstantValue(instance);
    setNuxtApp({ $scopeController: scope });

    expect(useInstance<typeof instance>(symbol)).toBe(instance);
  });

  it('fails clearly when the application has not provided a scope', () => {
    setNuxtApp({});

    expect(() => useScopeController()).toThrow(
      'Scope controller is not available. Provide it from an application plugin.',
    );
  });
});
