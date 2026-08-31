import 'reflect-metadata';
import { makeAssemblies } from '@src-internal/di';

import type { Assembly } from '@/di';

// MARK: - Exports

export * from './build';
export * from './converter';
export * from './device';
export * from './di';
export * from './error';
export * from './environment';
export * from './formatter';
export * from './l10n';
export * from './foundation';
export * from './localization';
export * from './model';
export * from './mutex';
export * from './operation';
export * from './security';
export * from './utils';
export * from './validation';

export function coreAssembly(): Assembly[] {
  return makeAssemblies();
}
