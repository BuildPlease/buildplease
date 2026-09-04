import { FormatterAssembly } from '@internal/neutral/di/assemblies/formatter';
import type { Container } from 'inversify';

export type { Container } from 'inversify';
export type AssemblyContainer = Container;

export interface Assembly {
  assemble(container: AssemblyContainer): void;
}

export class CoreAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    new FormatterAssembly().assemble(container);
  }
}
