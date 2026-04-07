import 'reflect-metadata';

import { type Assembly, coreAssembly } from '@meawkit/core';
import { makeAssemblies } from '@internal/injection';

// MARK: - Exports

export * from '@meawkit/core';
export * from './di';
export * from './model';
export * from './networking';

export function webkitAssembly(): Assembly[] {
  const coreAssemblies = coreAssembly();
  const assemblies = makeAssemblies();

  return [...coreAssemblies, ...assemblies];
}
