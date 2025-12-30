import type { Assembly, AssemblyContainer } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '@/di';
import { type LoggerController, LoggerControllerImpl } from '@/logger';

export class LoggerAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<LoggerController>(ApiKitSymbols.DI.Logger.Controller)
      .to(LoggerControllerImpl)
      .inSingletonScope();
  }
}
