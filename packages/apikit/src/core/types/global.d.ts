import { ApiKitConfig, EnvironmentConfig } from '#/configuration';

declare global {
  var apikit: {
    config: ApiKitConfig;
    currentEnvironment: EnvironmentConfig;
  };
}

export {};
