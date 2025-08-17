import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import { type TemporaryFileRepository, TemporaryFileRepositoryImpl } from '#/file';

export class FileAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<TemporaryFileRepository>(ApiKitSymbols.DI.File.TemporaryRepository)
      .to(TemporaryFileRepositoryImpl);
  }
}
