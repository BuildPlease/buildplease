import { type Assembly, type AssemblyContainer, CoreSymbols } from '@buildplease/core';
import { type Logger, type LoggerOptions, LoggerImpl } from '@buildplease/core/node';
import { inject, injectable } from 'inversify';

import { type ApiKitController } from '@/configuration';
import { ApiKitSymbols } from '@/symbols';

@injectable()
class ApiKitLogger extends LoggerImpl {
  public constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    configuration: ApiKitController,
  ) {
    const logger = configuration.logger;
    const debug = configuration.isDebug;
    const options: LoggerOptions = logger.enabled
      ? {
          enabled: true,
          debug: debug,
          transports: logger.transports,
        }
      : {
          enabled: false,
          debug: debug,
        };

    super(options);
  }
}

export class LoggerAssembly implements Assembly {
  public assemble(container: AssemblyContainer): void {
    container.bind<Logger>(CoreSymbols.DI.Logger).to(ApiKitLogger).inSingletonScope();
  }
}
