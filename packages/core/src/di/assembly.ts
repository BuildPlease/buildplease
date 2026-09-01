import { FormatterAssembly } from '@src-internal/di/assemblies/formatter';
import type { Container } from 'inversify';

export type { Container } from 'inversify';
export type AssemblyContainer = Container;

export interface Assembly {
  assemble(container: AssemblyContainer): void;
}

export function coreAssembly(): Assembly[] {
  return [new FormatterAssembly()];
}
