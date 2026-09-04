import type { ScopeController } from '@buildplease/core';

import { useNuxtApp } from '#app';

interface ScopeControllerHost {
  readonly $scopeController?: ScopeController;
}

/**
 * Provides access to the scope controller supplied by the application.
 *
 * @returns {ScopeController} The scope controller instance.
 *
 * @example
 * const scopeController = useScopeController();
 * const myService = scopeController.getInstance<MyService>(AppSymbols.DI.MyService);
 */
export function useScopeController(): ScopeController {
  const app = useNuxtApp() as ReturnType<typeof useNuxtApp> & ScopeControllerHost;
  const scopeController = app.$scopeController;

  if (!scopeController) {
    throw new Error('Scope controller is not available. Provide it from an application plugin.');
  }

  return scopeController;
}
