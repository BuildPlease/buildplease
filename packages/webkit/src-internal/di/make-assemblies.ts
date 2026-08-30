import { type Assembly, coreAssembly } from '@buildplease/core';

export function makeAssemblies(): Assembly[] {
  return [...coreAssembly()];
}
