import type {
  ApiKitConfig,
  EmailConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
} from '@nidavellirx/meowv-apikit';

declare global {
  var apikit: {
    config: ApiKitConfig;
    environmentConfig: EnvironmentConfig;
    loggerConfig: LoggerConfig;
    serverConfig: ServerConfig;
    emailConfig: EmailConfig;
  };
}
