import { type Assembly, type AssemblyContainer, CoreSymbols } from '@/di';
import { type UnitFormatterController, UnitFormatterControllerImpl } from '@/formatter';

export class FormatterAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<UnitFormatterController>(CoreSymbols.DI.Formatter.UnitController).to(UnitFormatterControllerImpl);
  }
}
