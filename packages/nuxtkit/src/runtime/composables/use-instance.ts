import { useScopeController } from './use-scope-controller';

/**
 * Resolve a dependency from the scope supplied by the application.
 *
 * @param serviceIdentifier - Symbol used to resolve the dependency.
 * @returns An instance of the requested dependency.
 */
export function useInstance<T>(serviceIdentifier: symbol): T {
  return useScopeController().getInstance<T>(serviceIdentifier);
}
