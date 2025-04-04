import type { Container } from 'inversify';

import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';

import {
  type ServerController,
  ServerControllerImpl,
  type RequestController,
  RequestControllerImpl,
  type ResponseController,
  ResponseControllerImpl,
} from '#/server';

export class ServerAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<ServerController>(ApiKitSymbols.DI.Server.Controller)
      .to(ServerControllerImpl)
      .inSingletonScope();

    container
      .bind<RequestController>(ApiKitSymbols.DI.Server.RequestController)
      .to(RequestControllerImpl)
      .inSingletonScope();

    container
      .bind<ResponseController>(ApiKitSymbols.DI.Server.ResponseController)
      .to(ResponseControllerImpl)
      .inSingletonScope();
  }
}
