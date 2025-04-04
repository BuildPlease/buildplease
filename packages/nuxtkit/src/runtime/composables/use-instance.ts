import { useNuxtApp } from '#app';

/**
 * Generic composable for resolving ViewModel dependencies.
 *
 * @param serviceIdentifier - Symbol used to resolve the dependency.
 * @returns An instance of the requested ViewModel.
 */
export function useInstance<T>(serviceIdentifier: symbol): T {
  const { $getInstance } = useNuxtApp();

  return $getInstance(serviceIdentifier);
}
