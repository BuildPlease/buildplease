import { EnvironmentConfig } from '@/core/configuration/environmentConfig';

export interface ApiKitConfig {
  /**
   * Defines all available environments in the application.
   */
  environments: EnvironmentConfig[];

  /**
   * Output directory for the built files.
   * Default: 'runtime'
   */
  outDir: string;
}

/**
 * Defines the ApiKit configuration.
 */
export function defineApikitConfig(config: ApiKitConfig): ApiKitConfig {
  validateApikitConfig(config);

  return config;
}

function validateApikitConfig(config: ApiKitConfig) {
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
}
