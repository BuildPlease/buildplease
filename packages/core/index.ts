import 'reflect-metadata';
import { Assembly } from '@/di';

export * from './src';

function makeAssemblies(): Assembly[] {
  return [];
}

export function MEOWV_CORE_INITIALIZE(): Assembly[] {
  return makeAssemblies();
}
