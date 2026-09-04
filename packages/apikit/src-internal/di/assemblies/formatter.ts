import type { Assembly, AssemblyContainer } from '@buildplease/core';

import {
  type FormatterController,
  type MultipartFormatterController,
  FormatterControllerImpl,
  MultipartFormatterControllerImpl,
} from '@/formatter';
import { ApiKitSymbols } from '@/symbols';

export class FormatterAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<FormatterController>(ApiKitSymbols.DI.Formatter.Controller).to(FormatterControllerImpl);

    container
      .bind<MultipartFormatterController>(ApiKitSymbols.DI.Formatter.MultipartController)
      .to(MultipartFormatterControllerImpl);
  }
}
