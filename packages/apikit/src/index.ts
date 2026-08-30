import 'reflect-metadata';

import { type Assembly, coreAssembly } from '@buildplease/core';
import { makeAssemblies } from '@src-internal/di';

import '../types';

// MARK: - Exports

export * from '@buildplease/core';
export * from '@buildplease/core/node';
export * from './configuration';
export { defineConfig } from './configuration';
export * from './database';
export * from './di';
export * from './email';
export * from './error';
export * from './file';
export * from './formatter';
export * from './generator';
export * from './http';
export * from './i18n';
export * from './l10n';
export * from './image';
export * from './normalization';
export * from './notification';
export * from './openapi';
export * from './request';
export * from './security';
export * from './server';
export * from './validation';

export function apikitAssembly(): Assembly[] {
  return [...coreAssembly(), ...makeAssemblies()];
}
