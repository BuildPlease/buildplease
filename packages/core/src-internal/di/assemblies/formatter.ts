import type { Container } from 'inversify';

import { CoreSymbols } from '@/di/symbols';
import { type UnitFormatterController, UnitFormatterControllerImpl } from '@/formatter/unit-formatter-controller';

export class FormatterAssembly {
  public assemble(container: Container): void {
    container.bind<UnitFormatterController>(CoreSymbols.DI.Formatter.UnitController).to(UnitFormatterControllerImpl);
  }
}
