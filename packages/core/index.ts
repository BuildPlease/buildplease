import 'reflect-metadata';
import type { Assembly } from '@/di';
import { Core_FormatterAssembly } from '@/index';

// MARK: - Exports

export * from './src';

export function MEOWV_CORE_INITIALIZE(): Assembly[] {
  return makeAssemblies();
}

// MARK: - Private

function makeAssemblies(): Assembly[] {
  return [new Core_FormatterAssembly()];
}
