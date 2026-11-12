import { type MongoDbQueryFormatter, MongoDbQueryFormatterImpl } from '@/database';
import { Symbols } from '@/symbols';
import type { Assembly, AssemblyContainer } from '@buildplease/core';

export class DatabaseAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<MongoDbQueryFormatter>(Symbols.DI.Formatter.MongoDBQuery).to(MongoDbQueryFormatterImpl);
  }
}
