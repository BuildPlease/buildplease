import type {
  EmailConfig,
  EnvironmentConfig,
  I18nConfig,
  LoggerConfig,
  ServerConfig,
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
