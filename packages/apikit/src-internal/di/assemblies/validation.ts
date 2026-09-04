import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { ApiKitSymbols } from '@/symbols';
import {
  type DtoValidationController,
  type ValidationController,
  DtoValidationControllerImpl,
  ValidationControllerImpl,
} from '@/validation';

export class ValidationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<ValidationController>(ApiKitSymbols.DI.Validation.Controller).to(ValidationControllerImpl);

    container.bind<DtoValidationController>(ApiKitSymbols.DI.Validation.DtoController).to(DtoValidationControllerImpl);
  }
}
