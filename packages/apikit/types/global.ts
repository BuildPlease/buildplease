import type {
  EmailConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
  I18nConfig,
  StaticFilesConfig,
} from '@/configuration';

declare global {
  var apikit: {
    isDebug: boolean;
    environmentConfig: EnvironmentConfig;
    loggerConfig: LoggerConfig;
    serverConfig: ServerConfig;
    emailConfig: EmailConfig;
    i18nConfig?: I18nConfig;
    staticFilesConfig?: StaticFilesConfig;
  };
}

export {};
