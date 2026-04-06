import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { ApiKitSymbols } from '@/di';
import { type NormalizationController, NormalizationControllerImpl } from '@/normalization';

export class NormalizationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<NormalizationController>(ApiKitSymbols.DI.Normalization.Controller)
      .to(NormalizationControllerImpl);
  }
}
