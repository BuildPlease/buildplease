import { CoreSymbols } from '@neutral/di/symbols';
import {
  type UnitFormatterController,
  UnitFormatterControllerImpl,
} from '@neutral/formatter/unit-formatter-controller';
import type { Container } from 'inversify';

export class FormatterAssembly {
  public assemble(container: Container): void {
    container.bind<UnitFormatterController>(CoreSymbols.DI.Formatter.UnitController).to(UnitFormatterControllerImpl);
  }
}
