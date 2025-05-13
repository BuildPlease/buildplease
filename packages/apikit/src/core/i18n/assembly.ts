import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type I18nController, I18nControllerImpl } from '#/i18n';

export class I18nAssembly implements Assembly {
  public assemble(container: Container): void {
    container.bind<I18nController>(ApiKitSymbols.DI.I18n.Controller).to(I18nControllerImpl);
  }
}
