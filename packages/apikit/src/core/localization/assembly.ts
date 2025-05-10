import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type LocalizationController, LocalizationControllerImpl } from '#/localization';

export class LocalizationAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<LocalizationController>(ApiKitSymbols.DI.Localization.Controller)
      .to(LocalizationControllerImpl);
  }
}
