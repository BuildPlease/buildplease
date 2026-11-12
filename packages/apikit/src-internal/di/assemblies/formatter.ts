import { type MultipartFormatter, MultipartFormatterImpl } from '@/formatter';
import { Symbols } from '@/symbols';
import type { Assembly, AssemblyContainer } from '@buildplease/core';

export class FormatterAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<MultipartFormatter>(Symbols.DI.Formatter.Multipart).to(MultipartFormatterImpl);
  }
}
