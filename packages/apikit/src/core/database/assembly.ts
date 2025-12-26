import type { Assembly, AssemblyContainer } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type MongoDbQueryFormatter, MongoDbQueryFormatterImpl } from '#/database';

export class ApiKit_DatabaseAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<MongoDbQueryFormatter>(ApiKitSymbols.DI.Database.MongoDB.QueryFormatter)
      .to(MongoDbQueryFormatterImpl);
  }
}
