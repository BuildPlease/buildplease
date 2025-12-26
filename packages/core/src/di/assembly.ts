import type { Container } from 'inversify';

export type { Container } from 'inversify';
export type AssemblyContainer = Container;

export interface Assembly {
  assemble(container: AssemblyContainer): void;
}
