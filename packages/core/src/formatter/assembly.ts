import { type UnitFormatterController, UnitFormatterControllerImpl } from '@/formatter';
import { type Assembly, type AssemblyContainer, CoreSymbols } from '@/di';

export class Core_FormatterAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container
      .bind<UnitFormatterController>(CoreSymbols.DI.Formatter.UnitController)
      .to(UnitFormatterControllerImpl);
  }
}
