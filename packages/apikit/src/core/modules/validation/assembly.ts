import { Container } from 'inversify';
import { Assembly } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/di';

import {
  ValidationController,
  ValidationControllerImpl,
  DtoValidationController,
  DtoValidationControllerImpl,
} from '$/validation';

export class ValidationAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<ValidationController>(ApikitSymbols.DI.Validation.Controller)
      .to(ValidationControllerImpl);

    container
      .bind<DtoValidationController>(ApikitSymbols.DI.Validation.DtoController)
      .to(DtoValidationControllerImpl);
  }
}
