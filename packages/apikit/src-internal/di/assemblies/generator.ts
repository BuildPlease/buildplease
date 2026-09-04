import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type RandomValueGenerator, RandomValueGeneratorImpl } from '@/generator';
import { ApiKitSymbols } from '@/symbols';

export class GeneratorAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<RandomValueGenerator>(ApiKitSymbols.DI.Generator.RandomValueGenerator).to(RandomValueGeneratorImpl);
  }
}
