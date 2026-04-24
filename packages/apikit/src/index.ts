import 'reflect-metadata';
import { makeAssemblies } from '@internal/injection';
import { type Assembly, coreAssembly } from '@meawkit/core';

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

export function apikitAssembly(): Assembly[] {
  const core = coreAssembly();
  const assemblies = makeAssemblies();

  return [...core, ...assemblies];
}
