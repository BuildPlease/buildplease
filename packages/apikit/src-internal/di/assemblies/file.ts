import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type TemporaryFileRepository, TemporaryFileRepositoryImpl } from '@/file';
import { ApiKitSymbols } from '@/symbols';

export class FileAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<TemporaryFileRepository>(ApiKitSymbols.DI.File.TemporaryRepository).to(TemporaryFileRepositoryImpl);
  }
}
