import type { Build, Environment } from '@buildplease/core';

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
    build: Build;
    environment: Environment;
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
