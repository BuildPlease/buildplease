import { injectable } from 'inversify';

import type {
  EmailConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
  I18nConfig,
  StaticFilesConfig,
} from '@/configuration';

export interface ApiKitController {
  get isDebug(): boolean;
  get environment(): EnvironmentConfig;
  get logger(): LoggerConfig;
  get server(): ServerConfig;
  get email(): EmailConfig;
  get i18n(): I18nConfig | undefined;
  get staticFiles(): StaticFilesConfig | undefined;
}

@injectable()
export class ApiKitControllerImpl implements ApiKitController {
  private readonly _isDebug: boolean;
  private readonly _environment: EnvironmentConfig;
  private readonly _logger: LoggerConfig;
  private readonly _server: ServerConfig;
  private readonly _email: EmailConfig;
  private readonly _i18n?: I18nConfig;
  private readonly _staticFiles?: StaticFilesConfig;

  constructor() {
    this._isDebug = this.loadDebug();
    this._environment = this.loadEnvironmentConfig();
    this._logger = this.loadLoggerConfig();
    this._server = this.loadServerConfig();
    this._email = this.loadEmailConfig();
    this._i18n = this.loadI18nConfig();
    this._staticFiles = this.loadStaticFilesConfig();
  }

  get isDebug(): boolean {
    return this._isDebug;
  }

  get environment(): EnvironmentConfig {
    return this._environment;
  }

  get logger(): LoggerConfig {
    return this._logger;
  }

  get server(): ServerConfig {
    return this._server;
  }

  get email(): EmailConfig {
    return this._email;
  }

  get i18n(): I18nConfig | undefined {
    return this._i18n;
  }

  get staticFiles(): StaticFilesConfig | undefined {
    return this._staticFiles;
  }

  // MARK: - Private loaders
  private loadDebug(): boolean {
    return global.apikit.isDebug;
  }

  private loadEnvironmentConfig(): EnvironmentConfig {
    const config = global.apikit?.environmentConfig;
    if (!config) throw new Error('Environment config is missing.');
    return config;
  }

  private loadLoggerConfig(): LoggerConfig {
    const config = global.apikit?.loggerConfig;
    if (!config) throw new Error('Logger config is missing.');
    return config;
  }

  private loadServerConfig(): ServerConfig {
    const config = global.apikit?.serverConfig;
    if (!config) throw new Error('Server config is missing.');
    return config;
  }

  private loadEmailConfig(): EmailConfig {
    const config = global.apikit?.emailConfig;
    if (!config) throw new Error('Email config is missing.');
    return config;
  }

  private loadI18nConfig(): I18nConfig | undefined {
    return global.apikit?.i18nConfig;
  }

  private loadStaticFilesConfig(): StaticFilesConfig | undefined {
    return global.apikit?.staticFilesConfig;
  }
}
