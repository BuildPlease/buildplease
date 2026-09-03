import { Container } from 'inversify';

import type { Assembly } from './assembly';

export class ScopeController {
  private _container: Container;

  constructor() {
    this._container = new Container();
  }

  public get container(): Container {
    return this._container;
  }

  public getInstance<T>(serviceIdentifier: symbol): T {
    return this.container.get<T>(serviceIdentifier);
  }

  public async registerAssemblies(assemblies: Assembly[]): Promise<void> {
    assemblies.forEach((a) => a.assemble(this.container));
  }
}
