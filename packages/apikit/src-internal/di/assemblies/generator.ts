import { type RandomValueGenerator, RandomValueGeneratorImpl } from '@/generator';
import { Symbols } from '@/symbols';
import type { Assembly, AssemblyContainer } from '@buildplease/core';

export class GeneratorAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<RandomValueGenerator>(Symbols.DI.Generator.RandomValue).to(RandomValueGeneratorImpl);
  }
}
