import { ApiKitConfigDefaults } from '@internal/configuration';
import { isDefinedAndNotNull } from '@meawkit/core';

import type {
  ApiKitConfig,
  EmailConfig,
  EnvironmentConfig,
  I18nConfig,
  LoggerConfig,
  ServerConfig,
  StaticFilesConfig,
} from '@/configuration';

type EnvironmentNames<T extends readonly EnvironmentConfig[]> = T extends readonly (infer U)[]
  ? U extends EnvironmentConfig
    ? U['name']
    : never
  : never;

interface ApiKitConfigInput<Environments extends readonly EnvironmentConfig[]> {
  /**
   * @see {@link ApiKitConfig.outDir}
   * @default "apikit-runtime"
   */
  outDir?: string;
  /**
   * @see {@link ApiKitConfig.environments}
   */
  environments: Environments;
  /**
   * @see {@link ApiKitConfig.server}
   */
  server: { [K in EnvironmentNames<Environments>]: ServerConfig };
  /**
   * @see {@link ApiKitConfig.logger}
   */
  logger?: Partial<{ [K in EnvironmentNames<Environments>]: LoggerConfig }>;
  /**
   * @see {@link ApiKitConfig.email}
   */
  email: EmailConfig;
  /**
   * @see {@link ApiKitConfig.i18n}
   */
  i18n?: I18nConfig;
  /**
   * @see {@link ApiKitConfig.staticFiles}
   */
  staticFiles?: StaticFilesConfig;
}

export function defineApikitConfig<const Environments extends readonly EnvironmentConfig[]>(
  config: ApiKitConfigInput<Environments>,
): ApiKitConfig {
  validateEnvironmentConfig(config);
  validateServerConfig(config);
  const logger = validateLoggerConfig(config);
  const outDir = config.outDir ?? ApiKitConfigDefaults.outDir;

  return {
    outDir: outDir,
    environments: config.environments,
    server: config.server,
    logger: logger,
    email: config.email,
    i18n: config.i18n,
    staticFiles: config.staticFiles,
  };
}

// MARK: - Private

function validateEnvironmentConfig<const Environments extends readonly EnvironmentConfig[]>(
  config: ApiKitConfigInput<Environments>,
): asserts config is ApiKitConfigInput<Environments> & { environments: Environments } {
  if (!config.environments?.length) {
    throw new Error('At least one environment must be defined.');
  }

  for (const environment of config.environments) {
    if (!environment.file) {
      throw new Error(`Invalid configuration for environment "${environment.name}". "file" is mandatory.`);
    }
  }
}

function validateServerConfig<const Environments extends readonly EnvironmentConfig[]>(
  config: ApiKitConfigInput<Environments>,
): void {
  const identifiers = Object.values(config.server)
    .filter((server): server is ServerConfig => isDefinedAndNotNull(server))
    .map((server) => server.identifier);

  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error('Server identifiers must be unique');
  }
}

function validateLoggerConfig<const Environments extends readonly EnvironmentConfig[]>(
  config: ApiKitConfigInput<Environments>,
): Record<string, LoggerConfig> {
  const result: Record<string, LoggerConfig> = {};
  const defaults = ApiKitConfigDefaults.logger.config;

  for (const environment of config.environments) {
    const name = environment.name as EnvironmentNames<Environments>;
    const input = config.logger?.[name];

    const disabled = input?.disabled ?? defaults.disabled;
    const transports = input?.transports ?? defaults.transports;

    result[name] = {
      disabled,
      transports: [...transports],
    };
  }

  return result;
}
