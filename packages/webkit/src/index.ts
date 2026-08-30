import 'reflect-metadata';
import { type Assembly, coreAssembly } from '@buildplease/core';

// MARK: - Exports

export * from '@buildplease/core';
export * from './di';
export * from './l10n';
export * from './model';
export * from './networking';

export function webkitAssembly(): Assembly[] {
  return coreAssembly();
}
