import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { Symbols } from '@/symbols';
import {
  type DTOValidationController,
  type ValidationController,
  DTOValidationControllerImpl,
  ValidationControllerImpl,
} from '@/validation';

export class ValidationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<ValidationController>(Symbols.DI.Validation.Controller).to(ValidationControllerImpl);

    container.bind<DTOValidationController>(Symbols.DI.Validation.DTOController).to(DTOValidationControllerImpl);
  }
}
