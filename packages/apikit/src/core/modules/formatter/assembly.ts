import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/di';
import { type FormatterController, FormatterControllerImpl } from '$/formatter';

export class FormatterAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<FormatterController>(ApikitSymbols.DI.Formatter.Controller)
      .to(FormatterControllerImpl)
      .inSingletonScope();
  }
}
