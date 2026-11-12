import { type TemporaryFileRepository, TemporaryFileRepositoryImpl } from '@/file';
import { Symbols } from '@/symbols';
import type { Assembly, AssemblyContainer } from '@buildplease/core';

export class FileAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<TemporaryFileRepository>(Symbols.DI.Repository.TemporaryFile).to(TemporaryFileRepositoryImpl);
  }
}
