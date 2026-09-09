import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type RandomValueGenerator, RandomValueGeneratorImpl } from '@/generator';
import { Symbols } from '@/symbols';

export class GeneratorAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<RandomValueGenerator>(Symbols.DI.Generator.RandomValue).to(RandomValueGeneratorImpl);
  }
}
