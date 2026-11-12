import { type ConfigurationController, ConfigurationControllerImpl } from '@/configuration';
import { Symbols } from '@/symbols';
import type { Assembly, AssemblyContainer } from '@buildplease/core';

export class ConfigurationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<ConfigurationController>(Symbols.DI.Configuration.Controller)
      .to(ConfigurationControllerImpl)
      .inSingletonScope();
  }
}
