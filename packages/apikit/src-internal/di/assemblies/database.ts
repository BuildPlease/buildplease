import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { type MongoDbQueryFormatter, MongoDbQueryFormatterImpl } from '@/database';
import { ApiKitSymbols } from '@/di';

export class DatabaseAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<MongoDbQueryFormatter>(ApiKitSymbols.DI.Database.MongoDB.QueryFormatter)
      .to(MongoDbQueryFormatterImpl);
  }
}
