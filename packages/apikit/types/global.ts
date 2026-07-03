import type {
  BasicAuthConfig,
  BuildConfig,
  CorsConfig,
  EmailConfig,
  EnvironmentConfig,
  HealthConfig,
  I18nConfig,
  LoggerConfig,
  MetricsConfig,
  MultipartConfig,
  ServerConfig,
  StaticFilesConfig,
} from '@/configuration';

declare global {
  var apikit: {
    buildConfig: BuildConfig;
    environmentConfig: EnvironmentConfig;
    loggerConfig: LoggerConfig;
    serverConfig: ServerConfig;
    metricsConfig: MetricsConfig;
    healthConfig: HealthConfig;
    emailConfig: EmailConfig;
    i18nConfig: I18nConfig;
    staticFilesConfig: StaticFilesConfig;
    basicAuthConfig: BasicAuthConfig;
    corsConfig: CorsConfig;
    multipartConfig: MultipartConfig;
  };
}

export {};
