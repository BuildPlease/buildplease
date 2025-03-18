import { EnvironmentConfig } from '@/core/environment';

export interface ApiKitConfig {
  /**
   * Defines all available environments in the application.
   */
  environments: EnvironmentConfig[];

  /**
   * Output directory for the built files.
   * Default: 'dist'
   */
  outDir?: string;
}

/**
 * Validates and defines the ApiKit configuration.
 */
export function defineApikitConfig(config: ApiKitConfig): ApiKitConfig {
  config.environments.forEach((env) => {
    if (!env.file) {
      throw new Error(
        `Invalid configuration for environment "${env.name}". "file" is mandatory.`,
      );
    }
  });
  return config;
}
