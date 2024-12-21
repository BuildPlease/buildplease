import 'reflect-metadata';

import { MEOWV_CORE_INITIALIZE, Assembly } from '@nidavellirx/meowv-core';
import { makeAssemblies } from '@configuration';

export * from './src';
export * from './configuration/symbols';
export * from '@nidavellirx/meowv-core';

export function MEOWV_WEBKIT_INITIALIZE(): Assembly[] {
  const coreAssemblies = MEOWV_CORE_INITIALIZE();
  const webkitAssemblies = makeAssemblies();

  return [...webkitAssemblies, ...coreAssemblies];
}
