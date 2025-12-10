import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import {
  type MongoDbQueryFormatter,
  type MongoDbGeoJSONFormatter,
  MongoDbQueryFormatterImpl,
  MongoDbGeoJSONFormatterImpl,
} from '#/database';

export class ApiKit_DatabaseAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<MongoDbQueryFormatter>(ApiKitSymbols.DI.Database.MongoDB.QueryFormatter)
      .to(MongoDbQueryFormatterImpl);

    container
      .bind<MongoDbGeoJSONFormatter>(ApiKitSymbols.DI.Database.MongoDB.GeoJSONFormatter)
      .to(MongoDbGeoJSONFormatterImpl);
  }
}
