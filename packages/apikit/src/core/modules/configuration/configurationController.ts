import { injectable } from 'inversify';

import type { EnvironmentConfig, LoggerConfig } from '$/configuration';

export interface ConfigurationController {
  get environment(): EnvironmentConfig;
  get logger(): LoggerConfig;
}

@injectable()
export class ConfigurationControllerImpl implements ConfigurationController {
  private _environment: EnvironmentConfig;
  private _logger: LoggerConfig;

  constructor() {
    this._environment = this.makeEnvironment();
    this._logger = this.makeLogger();
  }

  public get environment(): EnvironmentConfig {
    return this._environment;
  }

  public get logger(): LoggerConfig {
    return this._logger;
  }

  private makeEnvironment(): EnvironmentConfig {
    const environment = global.apikit.currentEnvironment;

    if (!environment) {
      throw new Error('Current environment is not defined.');
    }

    return environment;
  }

  private makeLogger(): LoggerConfig {
    const loggerConfig = this._environment.logger;

    return loggerConfig;
  }
}
