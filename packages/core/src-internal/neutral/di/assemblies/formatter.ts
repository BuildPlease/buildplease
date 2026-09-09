import { type DateTimeFormatter, DateTimeFormatterImpl } from '@neutral/formatter/date-time-formatter';
import {
  type UnitFormatterController,
  UnitFormatterControllerImpl,
} from '@neutral/formatter/unit-formatter-controller';
import { CoreSymbols } from '@neutral/symbols';
import type { Container } from 'inversify';

export class FormatterAssembly {
  public assemble(container: Container): void {
    container.bind<DateTimeFormatter>(CoreSymbols.DI.Formatter.DateTime).to(DateTimeFormatterImpl);
    container.bind<UnitFormatterController>(CoreSymbols.DI.Formatter.UnitController).to(UnitFormatterControllerImpl);
  }
}
