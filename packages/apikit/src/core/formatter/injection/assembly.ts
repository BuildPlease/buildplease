import { Container } from 'inversify';
import { Assembly } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/configuration';
import { FormatterController, FormatterControllerImpl } from '#/formatter';

export class FormatterAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<FormatterController>(ApikitSymbols.DI.Formatter.Controller)
      .to(FormatterControllerImpl)
      .inSingletonScope();
  }
}
