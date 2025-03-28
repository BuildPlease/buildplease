import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { MeowvWebkitSymbols } from '@configuration';

import {
  type SchemaValidationController,
  SchemaValidationControllerImpl,
} from '@/validation';

export class ValidationAssembly implements Assembly {
  assemble(container: Container): void {
    container
      .bind<SchemaValidationController>(
        MeowvWebkitSymbols.DI.Validation.SchemaController,
      )
      .to(SchemaValidationControllerImpl);
  }
}
