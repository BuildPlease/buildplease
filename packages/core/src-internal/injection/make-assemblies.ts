import { type Assembly } from '@/di';

import { FormatterAssembly } from './assemblies/formatter';

export function makeAssemblies(): Assembly[] {
  return [new FormatterAssembly()];
}
