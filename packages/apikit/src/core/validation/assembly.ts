import type { Assembly, AssemblyContainer } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import {
  type ValidationController,
  ValidationControllerImpl,
  type DtoValidationController,
  DtoValidationControllerImpl,
} from '#/validation';

export class ApiKit_ValidationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<ValidationController>(ApiKitSymbols.DI.Validation.Controller).to(ValidationControllerImpl);

    container
      .bind<DtoValidationController>(ApiKitSymbols.DI.Validation.DtoController)
      .to(DtoValidationControllerImpl);
  }
}
