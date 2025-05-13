import { injectable } from 'inversify';

import type {
  EmailConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
  I18nConfig,
  StaticFilesConfig,
} from '#/configuration';

export interface ApiKitController {
  get environment(): EnvironmentConfig;
  get logger(): LoggerConfig;
  get server(): ServerConfig;
  get email(): EmailConfig;
  get i18n(): I18nConfig | undefined;
  get staticFile(): StaticFilesConfig | undefined;
}

@injectable()
export class ApiKitControllerImpl implements ApiKitController {
  get environment(): EnvironmentConfig {
    if (!global.apikit?.environmentConfig) {
      throw new Error('Current environment is not defined.');
    }
    return global.apikit.environmentConfig;
  }

  get logger(): LoggerConfig {
    if (!global.apikit?.loggerConfig) {
      throw new Error('Logger configuration is not defined.');
    }
    return global.apikit.loggerConfig;
  }

  get server(): ServerConfig {
    if (!global.apikit?.serverConfig) {
      throw new Error('Server configuration is not defined.');
    }
    return global.apikit.serverConfig;
  }

  get email(): EmailConfig {
    if (!global.apikit?.emailConfig) {
      throw new Error('Email configuration is not defined.');
    }
    return global.apikit.emailConfig;
  }

  get i18n(): I18nConfig | undefined {
    return global.apikit.i18nConfig;
  }

  get staticFile(): StaticFilesConfig | undefined {
    return global.apikit.staticFileConfig;
  }
}
