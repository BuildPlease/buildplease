import { injectable } from 'inversify';

import type {
  EmailConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
} from '#/configuration';

export interface ApiKitController {
  get environment(): EnvironmentConfig;
  get logger(): LoggerConfig;
  get server(): ServerConfig;
  get email(): EmailConfig;
}

@injectable()
export class ApiKitControllerImpl implements ApiKitController {
  private _environment: EnvironmentConfig;
  private _logger: LoggerConfig;
  private _server: ServerConfig;
  private _email: EmailConfig;

  constructor() {
    this._environment = this.makeEnvironment();
    this._logger = this.makeLogger();
    this._server = this.makeServer();
    this._email = this.makeEmail();
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

  public get email(): EmailConfig {
    return this._email;
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

  private makeEmail(): EmailConfig {
    const emailConfig = global.apikit.emailConfig;

    if (!emailConfig) {
      throw new Error('Email configuration is not defined.');
    }

    return emailConfig;
  }
}
