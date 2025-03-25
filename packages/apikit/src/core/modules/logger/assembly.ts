import { Container } from 'inversify';

import type { Assembly } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/di';
import { type LoggerController, LoggerControllerImpl } from '$/logger';

export class LoggerAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<LoggerController>(ApikitSymbols.DI.Logger.Controller)
      .to(LoggerControllerImpl)
      .inSingletonScope();
  }
}
