import type { Assembly, AssemblyContainer } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '@/di';
import {
  type ServerController,
  ServerControllerImpl,
  type RequestController,
  RequestControllerImpl,
  type ResponseController,
  ResponseControllerImpl,
} from '@/server';

export class ServerAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
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
