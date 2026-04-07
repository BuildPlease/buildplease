import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { type ApiKitController, ApiKitControllerImpl } from '@/configuration';
import { ApiKitSymbols } from '@/di';

export class ConfigurationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<ApiKitController>(ApiKitSymbols.DI.Configuration.Controller)
      .to(ApiKitControllerImpl)
      .inSingletonScope();
  }
}
