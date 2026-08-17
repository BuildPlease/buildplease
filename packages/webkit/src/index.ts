import 'reflect-metadata';
import { type Assembly, coreAssembly } from '@buildplease/core';
import { makeAssemblies } from '@src-internal/di';

// MARK: - Exports

export * from '@buildplease/core';
export * from './di';
export * from './l10n';
export * from './model';
export * from './networking';

export function webkitAssembly(): Assembly[] {
  const coreAssemblies = coreAssembly();
  const assemblies = makeAssemblies();

  return [...coreAssemblies, ...assemblies];
}
