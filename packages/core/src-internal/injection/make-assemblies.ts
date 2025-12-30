import { FormatterAssembly } from './assemblies/formatter';

import { type Assembly } from '@/di';

export function makeAssemblies(): Assembly[] {
  return [new FormatterAssembly()];
}
