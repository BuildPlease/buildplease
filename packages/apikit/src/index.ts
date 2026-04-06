import 'reflect-metadata';
import { type Assembly, MEOWV_CORE_INITIALIZE } from '@meawkit/core';

import '#/types';
import { makeAssemblies } from '@internal/injection';

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
export * from './http';
export * from './i18n';
export * from './image';
export * from './logger';
export * from './normalization';
export * from './openapi';
export * from './request';
export * from './security';
export * from './server';
export * from './validation';

export function MEOWV_APIKIT_INITIALIZE(): Assembly[] {
  const coreAssemblies = MEOWV_CORE_INITIALIZE();
  const apikitAssemblies = makeAssemblies();

  return [...coreAssemblies, ...apikitAssemblies];
}
