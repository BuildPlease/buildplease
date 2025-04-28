import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { WebKitSymbols } from '@/di';
import { type SchemaValidationController, SchemaValidationControllerImpl } from '@/validation';

export class ValidationAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<SchemaValidationController>(WebKitSymbols.DI.Validation.SchemaController)
      .to(SchemaValidationControllerImpl);
  }
}
