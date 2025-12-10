import type { Container } from 'inversify';
import type { Assembly } from '@nidavellirx/meowv-core';

import { CoreSymbols } from '@/di';
import { type UnitFormatterController, UnitFormatterControllerImpl } from './index';

export class Core_FormatterAssembly implements Assembly {
  public assemble(container: Container): void {
    container
      .bind<UnitFormatterController>(CoreSymbols.DI.Formatter.UnitController)
      .to(UnitFormatterControllerImpl);
  }
}
