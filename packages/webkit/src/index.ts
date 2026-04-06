import 'reflect-metadata';

import { type Assembly, MEOWV_CORE_INITIALIZE } from '@meawkit/core';
import { makeAssemblies } from '@internal/injection';

// MARK: - Exports

export * from '@meawkit/core';
export * from './di';
export * from './model';
export * from './networking';

export function MEOWV_WEBKIT_INITIALIZE(): Assembly[] {
  const coreAssemblies = MEOWV_CORE_INITIALIZE();
  const webkitAssemblies = makeAssemblies();

  return [...coreAssemblies, ...webkitAssemblies];
}
