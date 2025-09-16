import 'reflect-metadata';

import { type Assembly, MEOWV_CORE_INITIALIZE } from '@nidavellirx/meowv-core';

// MARK: - Exports

export * from './src';
export * from '@nidavellirx/meowv-core';

export function MEOWV_WEBKIT_INITIALIZE(): Assembly[] {
  const coreAssemblies = MEOWV_CORE_INITIALIZE();
  const webkitAssemblies = makeAssemblies();

  return [...webkitAssemblies, ...coreAssemblies];
}

// MARK: - Private

function makeAssemblies(): Assembly[] {
  return [];
}
