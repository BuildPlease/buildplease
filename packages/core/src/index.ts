import 'reflect-metadata';
import { makeAssemblies } from '@internal/injection';

import type { Assembly } from '@/di';

// MARK: - Exports

export * from './converter';
export * from './device';
export * from './di';
export * from './error';
export * from './formatter';
export * from './foundation';
export * from './localization';
export * from './model';
export * from './mutex';
export * from './operation';
export * from './security';
export * from './utils';
export * from './validation';

export function MEOWV_CORE_INITIALIZE(): Assembly[] {
  return makeAssemblies();
}
