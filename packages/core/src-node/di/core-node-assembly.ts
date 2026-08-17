import { makeAssemblies } from '@src-internal/di';
import type { LoggerOptions } from '@src-node/logger';

import type { Assembly } from '@/di';

import { LoggerAssembly } from './assemblies/logger';

export interface CoreNodeAssemblyOptions {
  readonly logger?: LoggerOptions;
}

export function coreNodeAssembly(options: CoreNodeAssemblyOptions = {}): Assembly[] {
  const loggerOptions = options.logger ?? { enabled: false };

  return [...makeAssemblies(), new LoggerAssembly(loggerOptions)];
}
