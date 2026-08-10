import 'reflect-metadata';
import { makeAssemblies } from '@internal/di';
import type { Assembly } from '@meawkit/core';
import { type LoggerOptions, coreNodeAssembly } from '@meawkit/core/node';

import '../types';

// MARK: - Exports

export * from '@meawkit/core';
export * from '@meawkit/core/node';
export * from './configuration';
export * from './database';
export * from './di';
export * from './email';
export * from './error';
export * from './file';
export * from './formatter';
export * from './generator';
export * from './http';
export * from './i18n';
export * from './image';
export * from './normalization';
export * from './notification';
export * from './openapi';
export * from './request';
export * from './security';
export * from './server';
export * from './validation';

export function apikitAssembly(): Assembly[] {
  const logger = global.apikit.loggerConfig;
  const loggerOptions: LoggerOptions = logger.enabled
    ? {
        enabled: true,
        debug: global.apikit.serverConfig.debug,
        transports: logger.transports,
      }
    : {
        enabled: false,
        debug: global.apikit.serverConfig.debug,
      };

  return [...coreNodeAssembly({ logger: loggerOptions }), ...makeAssemblies()];
}
