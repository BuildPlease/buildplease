import type {
  BasicAuthConfig,
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
