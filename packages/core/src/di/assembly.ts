import type { Container } from 'inversify';

export interface Assembly {
  assemble(container: Container): void;
}
