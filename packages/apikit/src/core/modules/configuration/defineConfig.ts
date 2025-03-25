import type { EnvironmentConfig } from './environmentConfig';

export interface ApiKitConfig {
  /**
   * Output directory for the built files.
   * Default: 'runtime'
   */
  outDir: string;

  /**
   * Defines all available environments in the application.
   * Apikit will load all variables from the environment file into process.env.
   * If NODE_ENV is defined in the file, it can cause issue.
   */
  environments: Array<EnvironmentConfig>;
}

/**
 * Defines the ApiKit configuration.
 */
export function defineApikitConfig(config: ApiKitConfig): ApiKitConfig {
  if (!config.environments || config.environments.length === 0) {
    throw new Error(`At least one environment must be defined.`);
  }

  config.environments.forEach((env) => {
    if (!env.file) {
      throw new Error(
        `Invalid configuration for environment "${env.name}". "file" is mandatory.`,
      );
    }
  });

  return config;
}
