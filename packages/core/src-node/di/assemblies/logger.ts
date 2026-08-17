import { type Logger, type LoggerOptions, LoggerImpl } from '@src-node/logger';

import { type Assembly, type AssemblyContainer, CoreSymbols } from '@/di';

export class LoggerAssembly implements Assembly {
  public constructor(private readonly options: LoggerOptions) {}

  public assemble(container: AssemblyContainer): void {
    container.bind<Logger>(CoreSymbols.DI.Logger).toConstantValue(new LoggerImpl(this.options));
  }
}
