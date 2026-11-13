import type { Assembly, AssemblyContainer } from '@buildplease/core';
import { type Logger, type LoggerOptions, LoggerImpl } from '@buildplease/core/node';
import { inject, injectable } from 'inversify';

import { type ConfigurationController } from '@/configuration';
import { Symbols } from '@/symbols';

@injectable()
class ApiKitLogger extends LoggerImpl {
  public constructor(
    @inject(Symbols.DI.Configuration.Controller)
    configuration: ConfigurationController,
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
    container.bind<Logger>(Symbols.DI.Logging.Logger).to(ApiKitLogger).inSingletonScope();
  }
}
