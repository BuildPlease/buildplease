import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type ConfigurationController, ConfigurationControllerImpl } from '@/configuration';
import { Symbols } from '@/symbols';

export class ConfigurationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<ConfigurationController>(Symbols.DI.Configuration.Controller)
      .to(ConfigurationControllerImpl)
      .inSingletonScope();
  }
}
