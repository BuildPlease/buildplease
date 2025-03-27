import type { EnvironmentConfig } from './environmentConfig';
import type { LoggerConfig } from './loggerConfig';
import type { ServerConfig } from './serverConfig';

export interface ApiKitConfig {
  outDir: string;
  environments: readonly EnvironmentConfig[];
  server: Record<string, ServerConfig>;
  logger: Record<string, LoggerConfig>;
}

type EnvironmentNames<T extends readonly EnvironmentConfig[]> =
  T extends readonly (infer U)[]
    ? U extends EnvironmentConfig
      ? U['name']
      : never
    : never;

interface ApiKitConfigInput<Environments extends readonly EnvironmentConfig[]> {
  outDir: string;
  environments: Environments;
  server: { [K in EnvironmentNames<Environments>]: ServerConfig };
  logger: { [K in EnvironmentNames<Environments>]: LoggerConfig };
}

export function defineApikitConfig<
  const Environments extends readonly EnvironmentConfig[],
>(config: ApiKitConfigInput<Environments>): ApiKitConfig {
  // Validation logic remains the same
  if (!config.environments?.length) {
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
