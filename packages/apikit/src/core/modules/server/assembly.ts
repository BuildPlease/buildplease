import type { Container } from 'inversify';

import type { Assembly } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/di';

import {
  type ServerController,
  ServerControllerImpl,
  type RequestController,
  RequestControllerImpl,
  type ResponseController,
  ResponseControllerImpl,
} from '$/server';

export class ServerAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<ServerController>(ApikitSymbols.DI.Server.Controller)
      .to(ServerControllerImpl)
      .inSingletonScope();

    container
      .bind<RequestController>(ApikitSymbols.DI.Server.RequestController)
      .to(RequestControllerImpl)
      .inSingletonScope();

    container
      .bind<ResponseController>(ApikitSymbols.DI.Server.ResponseController)
      .to(ResponseControllerImpl)
      .inSingletonScope();
  }
}
