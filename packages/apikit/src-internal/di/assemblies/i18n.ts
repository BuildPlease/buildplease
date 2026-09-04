import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type I18nController, I18nControllerImpl } from '@/i18n';
import { ApiKitSymbols } from '@/symbols';

export class I18nAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<I18nController>(ApiKitSymbols.DI.I18n.Controller).to(I18nControllerImpl);
  }
}
