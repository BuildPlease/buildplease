import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { ApiKitSymbols } from '@/di';
import { type I18nController, I18nControllerImpl } from '@/i18n';

export class I18nAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<I18nController>(ApiKitSymbols.DI.I18n.Controller).to(I18nControllerImpl);
  }
}
