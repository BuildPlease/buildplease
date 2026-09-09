import type { Assembly, AssemblyContainer } from '@buildplease/core';

import { type TemporaryFileRepository, TemporaryFileRepositoryImpl } from '@/file';
import { Symbols } from '@/symbols';

export class FileAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<TemporaryFileRepository>(Symbols.DI.Repository.TemporaryFile).to(TemporaryFileRepositoryImpl);
  }
}
