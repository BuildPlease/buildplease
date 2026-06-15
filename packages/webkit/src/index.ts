import 'reflect-metadata';
import { makeAssemblies } from '@internal/di';
import { type Assembly, coreAssembly } from '@meawkit/core';

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
