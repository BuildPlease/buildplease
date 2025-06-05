import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import {
  type ValidationController,
  ValidationControllerImpl,
  type DtoValidationController,
  DtoValidationControllerImpl,
} from '#/validation';

export class ValidationAssembly implements Assembly {
  public assemble(container: Container): void {
    container.bind<ValidationController>(ApiKitSymbols.DI.Validation.Controller).to(ValidationControllerImpl);

    container
      .bind<DtoValidationController>(ApiKitSymbols.DI.Validation.DtoController)
      .to(DtoValidationControllerImpl);
  }
}
