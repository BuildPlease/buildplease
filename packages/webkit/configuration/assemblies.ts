import type { Assembly } from '@nidavellirx/meowv-core';

import { ValidationAssembly } from '@/validation';
import { NetworkingAssembly } from '@/networking';

export function makeAssemblies(): Assembly[] {
  return [new ValidationAssembly(), new NetworkingAssembly()];
}
