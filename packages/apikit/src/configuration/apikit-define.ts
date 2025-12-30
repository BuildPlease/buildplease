import { isDefinedAndNotNull } from '@nidavellirx/meowv-core';

import { ApiKitConfigDefaults } from '@internal/configuration';
import type {
  ApiKitConfig,
  EmailConfig,
  EnvironmentConfig,
  ServerConfig,
  LoggerConfig,
  I18nConfig,
  StaticFilesConfig,
} from '@/configuration';

// MARK: - Main

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
  logger: { [K in EnvironmentNames<Environments>]: LoggerConfig };
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
  // MARK: - Validate environments
  if (!config.environments?.length) {
    throw new Error(`At least one environment must be defined.`);
  }

  config.environments.forEach((env) => {
    if (!env.file) {
      throw new Error(`Invalid configuration for environment "${env.name}". "file" is mandatory.`);
    }
  });

  // MARK: - Validate server identifiers uniqueness
  const identifiers = Object.values(config.server)
    .filter((server): server is ServerConfig => isDefinedAndNotNull(server))
    .map((server) => server.identifier);

  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error('Server identifiers must be unique');
  }

  return {
    outDir: config.outDir ?? ApiKitConfigDefaults.outDir,
    environments: config.environments,
    server: config.server,
    logger: config.logger,
    email: config.email,
    i18n: config.i18n,
    staticFiles: config.staticFiles,
  };
}
