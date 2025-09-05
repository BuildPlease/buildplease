import type { ScopeController } from '@nidavellirx/meowv-webkit';

import { useNuxtApp } from '#app';

/**
 * Provides access to the scope controller for dependency injection.
 *
 * @returns {ScopeController} The scope controller instance.
 *
 * @example
 * const scope = useScope();
 * const myService = scope.getInstance<MyService>(Symbols.MyService);
 */
export function useScopeController(): ScopeController {
  const { $scopeController } = useNuxtApp();

  if (!$scopeController) throw new Error('Failed to resolve Container.');

  return $scopeController;
}
