import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type NormalizationController, NormalizationControllerImpl } from '#/normalization';

export class NormalizationAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<NormalizationController>(ApiKitSymbols.DI.Normalization.Controller)
      .to(NormalizationControllerImpl)
      .inSingletonScope();
  }
}
