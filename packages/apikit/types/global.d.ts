import type {
  ApiKitConfig,
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
  };
}
