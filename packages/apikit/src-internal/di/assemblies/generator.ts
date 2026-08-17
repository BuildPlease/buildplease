import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { ApiKitSymbols } from '@/di';
import { type RandomValueGenerator, RandomValueGeneratorImpl } from '@/generator';

export class GeneratorAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<RandomValueGenerator>(ApiKitSymbols.DI.Generator.RandomValueGenerator).to(RandomValueGeneratorImpl);
  }
}
