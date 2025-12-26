import type { Assembly, AssemblyContainer } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type NormalizationController, NormalizationControllerImpl } from '#/normalization';

export class ApiKit_NormalizationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<NormalizationController>(ApiKitSymbols.DI.Normalization.Controller)
      .to(NormalizationControllerImpl);
  }
}
