import { Container } from 'inversify';
import { Assembly } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/configuration';
import { SchemaController, SchemaControllerImpl } from '#/schema';

export class SchemaAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<SchemaController>(ApikitSymbols.DI.Schema.Controller)
      .to(SchemaControllerImpl)
      .inSingletonScope();
  }
}
