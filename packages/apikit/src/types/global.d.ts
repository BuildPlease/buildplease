// MARK: - Global

import type {
  ApiKitConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
} from '#/configuration';

declare global {
  var apikit: {
    config: ApiKitConfig;
    environmentConfig: EnvironmentConfig;
    loggerConfig: LoggerConfig;
    serverConfig: ServerConfig;
  };
}

export {};
