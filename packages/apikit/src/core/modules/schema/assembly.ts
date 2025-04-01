import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '$/di';
import { type SchemaController, SchemaControllerImpl } from '$/schema';

export class SchemaAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<SchemaController>(ApiKitSymbols.DI.Schema.Controller)
      .to(SchemaControllerImpl)
      .inSingletonScope();
  }
}
