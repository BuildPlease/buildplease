import type { Assembly, AssemblyContainer } from '@buildplease/core';

import {
  type RequestController,
  type ResponseController,
  type ServerController,
  RequestControllerImpl,
  ResponseControllerImpl,
  ServerControllerImpl,
} from '@/server';
import { Symbols } from '@/symbols';

export class ServerAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<ServerController>(Symbols.DI.Server.Controller).to(ServerControllerImpl).inSingletonScope();

    container.bind<RequestController>(Symbols.DI.Server.RequestController).to(RequestControllerImpl).inSingletonScope();

    container
      .bind<ResponseController>(Symbols.DI.Server.ResponseController)
      .to(ResponseControllerImpl)
      .inSingletonScope();
  }
}
