import type { Environment } from '@buildplease/core';

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
import type { ApiKitBuild } from '@/configuration/build';

declare global {
  var apikit: {
    build: ApiKitBuild;
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
