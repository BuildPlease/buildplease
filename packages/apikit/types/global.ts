import type { BuildMetadata, EnvironmentConfig } from '@buildplease/core/node';

import type {
  BasicAuthConfig,
  CorsConfig,
  EmailConfig,
  HealthConfig,
  I18nConfig,
  LoggerConfig,
  MetricsConfig,
  MultipartConfig,
  NotificationConfig,
  ServerConfig,
  StaticFilesConfig,
} from '@/configuration';

declare global {
  var apikit: {
    build: BuildMetadata;
    environmentConfig: EnvironmentConfig;
    loggerConfig: LoggerConfig;
    serverConfig: ServerConfig;
    metricsConfig: MetricsConfig;
    healthConfig: HealthConfig;
    emailConfig: EmailConfig;
    notificationConfig: NotificationConfig;
    i18nConfig: I18nConfig;
    staticFilesConfig: StaticFilesConfig;
    basicAuthConfig: BasicAuthConfig;
    corsConfig: CorsConfig;
    multipartConfig: MultipartConfig;
    configurations: ReadonlyMap<string, unknown>;
  };
}

export {};
