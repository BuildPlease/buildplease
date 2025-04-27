import { injectable } from 'inversify';

import type {
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
} from '#/configuration';

export interface ApiKitController {
  get environment(): EnvironmentConfig;
  get logger(): LoggerConfig;
  get server(): ServerConfig;
}

@injectable()
export class ApiKitControllerImpl implements ApiKitController {
  private _environment: EnvironmentConfig;
  private _logger: LoggerConfig;
  private _server: ServerConfig;

  constructor() {
    this._environment = this.makeEnvironment();
    this._logger = this.makeLogger();
    this._server = this.makeServer();
  }

  public get environment(): EnvironmentConfig {
    return this._environment;
  }

  public get logger(): LoggerConfig {
    return this._logger;
  }

  public get server(): ServerConfig {
    return this._server;
  }

  private makeEnvironment(): EnvironmentConfig {
    const environment = global.apikit.environmentConfig;

    if (!environment) {
      throw new Error('Current environment is not defined.');
    }

    return environment;
  }

  private makeLogger(): LoggerConfig {
    const loggerConfig = global.apikit.loggerConfig;

    if (!loggerConfig) {
      throw new Error('Logger configuration is not defined.');
    }

    return loggerConfig;
  }

  private makeServer(): ServerConfig {
    const serverConfig = global.apikit.serverConfig;

    if (!serverConfig) {
      throw new Error('Server configuration is not defined.');
    }

    return serverConfig;
  }
}
