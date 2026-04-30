import type {
  EmailConfig,
  EnvironmentConfig,
  I18nConfig,
  LoggerConfig,
  MetricsConfig,
  ServerConfig,
  StaticFilesConfig,
} from '@/configuration';

declare global {
  var apikit: {
    isDebug: boolean;
    environmentConfig: EnvironmentConfig;
    loggerConfig: LoggerConfig;
    serverConfig: ServerConfig;
    metricsConfig: MetricsConfig;
    emailConfig: EmailConfig;
    i18nConfig?: I18nConfig;
    staticFilesConfig?: StaticFilesConfig;
  };
}

export {};
