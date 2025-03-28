import type { Container } from 'inversify';

import type { Assembly } from '@nidavellirx/meowv-core';

import {
  type ApiKitConfigurationController,
  ApiKitConfigurationControllerImpl,
} from './apikitConfig';

import { ApikitSymbols } from '#/di';

export class ConfigurationAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<ApiKitConfigurationController>(
        ApikitSymbols.DI.Configuration.Controller,
      )
      .to(ApiKitConfigurationControllerImpl)
      .inSingletonScope();
  }
}
