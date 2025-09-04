import type { Container } from 'inversify';

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
export function useContainer(): Container {
  const { $container } = useNuxtApp();

  if (!$container) {
    throw new Error('Failed to resolve Container.');
  }

  return $container;
}
