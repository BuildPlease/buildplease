import type { Container } from 'inversify';

import type { Assembly } from '@nidavellirx/meowv-core';

import {
  type ConfigurationController,
  ConfigurationControllerImpl,
} from './configurationController';

import { ApikitSymbols } from '#/di';

export class ConfigurationAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<ConfigurationController>(ApikitSymbols.DI.Configuration.Controller)
      .to(ConfigurationControllerImpl)
      .inSingletonScope();
  }
}
