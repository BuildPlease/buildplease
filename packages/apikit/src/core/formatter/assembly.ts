import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type FormatterController, FormatterControllerImpl } from '#/formatter';

export class FormatterAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<FormatterController>(ApiKitSymbols.DI.Formatter.Controller)
      .to(FormatterControllerImpl);
  }
}
