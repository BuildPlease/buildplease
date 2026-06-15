import type { Assembly, AssemblyContainer } from '@meawkit/core';

import { ApiKitSymbols } from '@/di';
import { type TemporaryFileRepository, TemporaryFileRepositoryImpl } from '@/file';

export class FileAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<TemporaryFileRepository>(ApiKitSymbols.DI.File.TemporaryRepository).to(TemporaryFileRepositoryImpl);
  }
}
