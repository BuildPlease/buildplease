import 'reflect-metadata';
import { type Assembly, MEOWV_CORE_INITIALIZE } from '@nidavellirx/meowv-core';

import './types';
import { makeAssemblies } from '@internal/injection';

// MARK: - Exports

export * from '@/index';
export * from '@nidavellirx/meowv-core';
export * from '@nidavellirx/meowv-core/node';

export function MEOWV_APIKIT_INITIALIZE(): Assembly[] {
  const coreAssemblies = MEOWV_CORE_INITIALIZE();
  const apikitAssemblies = makeAssemblies();

  return [...coreAssemblies, ...apikitAssemblies];
}
