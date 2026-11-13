import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type NormalizationController, NormalizationControllerImpl } from '@/normalization';
import { Symbols } from '@/symbols';

export class NormalizationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<NormalizationController>(Symbols.DI.Normalization.Controller).to(NormalizationControllerImpl);
  }
}
