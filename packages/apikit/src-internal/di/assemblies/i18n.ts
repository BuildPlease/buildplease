import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type I18nController, I18nControllerImpl } from '@/i18n';
import { Symbols } from '@/symbols';

export class I18nAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<I18nController>(Symbols.DI.I18n.Controller).to(I18nControllerImpl);
  }
}
