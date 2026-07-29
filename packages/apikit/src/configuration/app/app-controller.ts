import { injectable } from 'inversify';

import type {
  BasicAuthConfig,
  CorsConfig,
  EmailConfig,
  HealthConfig,
  I18nConfig,
  LoggerConfig,
  MetricsConfig,
  MultipartConfig,
  ServerConfig,
  StaticFilesConfig,
} from './configs';
import type { BuildMetadata } from '../core/build-metadata';
import type { ConfigurationContract } from '../core/configuration';
import type { EnvironmentConfig } from '../core/environments';

// MARK: - Public

export interface ApiKitController {
  get build(): BuildMetadata;
  get isDebug(): boolean;
  get environment(): EnvironmentConfig;

  get logger(): LoggerConfig;
  get server(): ServerConfig;
  get metrics(): MetricsConfig;
  get health(): HealthConfig;
  get email(): EmailConfig;
  get i18n(): I18nConfig;
  get staticFiles(): StaticFilesConfig;
  get basicAuth(): BasicAuthConfig;
  get cors(): CorsConfig;
  get multipart(): MultipartConfig;

  get<T>(configuration: ConfigurationContract<T, any>): T;
  optional<T>(configuration: ConfigurationContract<T, any>): T | undefined;
}

@injectable()
export class ApiKitControllerImpl implements ApiKitController {
  public get build(): BuildMetadata {
    return global.apikit.build;
  }

  public get isDebug(): boolean {
    return global.apikit.serverConfig.debug;
  }

  public get environment(): EnvironmentConfig {
    return global.apikit.environmentConfig;
  }

  public get logger(): LoggerConfig {
    return global.apikit.loggerConfig;
  }

  public get server(): ServerConfig {
    return global.apikit.serverConfig;
  }

  public get metrics(): MetricsConfig {
    return global.apikit.metricsConfig;
  }

  public get health(): HealthConfig {
    return global.apikit.healthConfig;
  }

  public get email(): EmailConfig {
    return global.apikit.emailConfig;
  }

  public get i18n(): I18nConfig {
    return global.apikit.i18nConfig;
  }

  public get staticFiles(): StaticFilesConfig {
    return global.apikit.staticFilesConfig;
  }

  public get basicAuth(): BasicAuthConfig {
    return global.apikit.basicAuthConfig;
  }

  public get cors(): CorsConfig {
    return global.apikit.corsConfig;
  }

  public get multipart(): MultipartConfig {
    return global.apikit.multipartConfig;
  }

  public get<T>(configuration: ConfigurationContract<T, any>): T {
    if (!global.apikit.configurations.has(configuration.key)) {
      throw new Error(`Configuration "${configuration.key}" is missing.`);
    }

    return global.apikit.configurations.get(configuration.key) as T;
  }

  public optional<T>(configuration: ConfigurationContract<T, any>): T | undefined {
    return global.apikit.configurations.get(configuration.key) as T | undefined;
  }
}
