import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import {
  type FormatterController,
  type MultipartFormatterController,
  FormatterControllerImpl,
  MultipartFormatterControllerImpl,
} from '#/formatter';

export class ApiKit_FormatterAssembly implements Assembly {
  public assemble(container: Container): void {
    container.bind<FormatterController>(ApiKitSymbols.DI.Formatter.Controller).to(FormatterControllerImpl);

    container
      .bind<MultipartFormatterController>(ApiKitSymbols.DI.Formatter.MultipartController)
      .to(MultipartFormatterControllerImpl);
  }
}
