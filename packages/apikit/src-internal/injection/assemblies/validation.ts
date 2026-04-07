import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { ApiKitSymbols } from '@/di';
import {
  type DtoValidationController,
  type ValidationController,
  DtoValidationControllerImpl,
  ValidationControllerImpl,
} from '@/validation';

export class ValidationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<ValidationController>(ApiKitSymbols.DI.Validation.Controller).to(ValidationControllerImpl);

    container
      .bind<DtoValidationController>(ApiKitSymbols.DI.Validation.DtoController)
      .to(DtoValidationControllerImpl);
  }
}
