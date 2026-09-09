import { type DateTimeFormatter, DateTimeFormatterImpl } from '@neutral/formatter/date-time-formatter';
import { type TimeIntervalFormatter, TimeIntervalFormatterImpl } from '@neutral/formatter/time-interval-formatter';
import { type UnitFormatter, UnitFormatterImpl } from '@neutral/formatter/unit-formatter';
import { Symbols } from '@neutral/symbols';
import type { Container } from 'inversify';

export class FormatterAssembly {
  public assemble(container: Container): void {
    container.bind<DateTimeFormatter>(Symbols.DI.Formatter.DateTime).to(DateTimeFormatterImpl);
    container.bind<TimeIntervalFormatter>(Symbols.DI.Formatter.TimeInterval).to(TimeIntervalFormatterImpl);
    container.bind<UnitFormatter>(Symbols.DI.Formatter.Unit).to(UnitFormatterImpl);
  }
}
