import type { Assembly, AssemblyContainer } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type ApiKitController, ApiKitControllerImpl } from '#/configuration';

export class ApiKit_ConfigurationAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<ApiKitController>(ApiKitSymbols.DI.Configuration.Controller)
      .to(ApiKitControllerImpl)
      .inSingletonScope();
  }
}
