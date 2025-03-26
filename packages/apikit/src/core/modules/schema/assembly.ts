import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/di';
import { type SchemaController, SchemaControllerImpl } from '$/schema';

export class SchemaAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<SchemaController>(ApikitSymbols.DI.Schema.Controller)
      .to(SchemaControllerImpl)
      .inSingletonScope();
  }
}
