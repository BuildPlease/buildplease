import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type MongoDbQueryFormatter, MongoDbQueryControllerImpl } from '#/database';

export class DatabaseAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<MongoDbQueryFormatter>(ApiKitSymbols.DI.Database.MongoDB.QueryFormatter)
      .to(MongoDbQueryControllerImpl);
  }
}
