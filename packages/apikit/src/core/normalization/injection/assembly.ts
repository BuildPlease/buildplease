import { Container } from 'inversify';
import { Assembly } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/configuration';
import {
  NormalizationController,
  NormalizationControllerImpl,
} from '#/normalization';

export class NormalizationAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<NormalizationController>(ApikitSymbols.DI.Normalization.Controller)
      .to(NormalizationControllerImpl)
      .inSingletonScope();
  }
}
