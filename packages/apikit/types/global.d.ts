import type {
  EmailConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
  I18nConfig,
  StaticFilesConfig,
} from '@nidavellirx/meowv-apikit';

declare global {
  var apikit: {
    debug: boolean;
    environmentConfig: EnvironmentConfig;
    loggerConfig: LoggerConfig;
    serverConfig: ServerConfig;
    emailConfig: EmailConfig;
    i18nConfig?: I18nConfig;
    staticFilesConfig?: StaticFilesConfig;
  };
}
