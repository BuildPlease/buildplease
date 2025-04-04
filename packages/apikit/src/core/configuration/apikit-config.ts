import { injectable } from 'inversify';

import { isDefinedAndNotNull } from '@nidavellirx/meowv-core';

import type {
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
} from '#/configuration';

/**
 * Configuration options for the Meowv API Kit.
 */
export interface ApiKitConfig {
  /**
   * The output directory where the generated API files will be stored.
   * If not specified, it defaults to `.apikit`.
   *
   * @default ".apikit"
   */
  outDir?: string;

  /**
   * A list of environment configurations.
   * Each environment defines specific settings for different runtime contexts.
   */
  environments: readonly EnvironmentConfig[];

  /**
   * Server configurations mapped by environment or custom keys.
   * Defines settings such as host, port, and other server options.
   */
  server: Record<string, ServerConfig>;

  /**
   * Logger configurations mapped by environment or custom keys.
   * Defines logging behavior such as log level, output format, etc.
   */
  logger: Record<string, LoggerConfig>;
}

export function defineApikitConfig<
  const Environments extends readonly EnvironmentConfig[],
>(config: ApiKitConfigInput<Environments>): ApiKitConfig {
  // MARK: - Validate environments
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

  // MARK: - Validate server identifiers uniqueness
  const identifiers = Object.values(config.server)
    .filter((server): server is ServerConfig => isDefinedAndNotNull(server))
    .map((server) => server.identifier);

  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error('Server identifiers must be unique');
  }

  return config;
}

export interface ApiKitConfigurationController {
  get environment(): EnvironmentConfig;
  get logger(): LoggerConfig;
  get server(): ServerConfig;
}

@injectable()
export class ApiKitConfigurationControllerImpl
  implements ApiKitConfigurationController
{
  private _environment: EnvironmentConfig;
  private _logger: LoggerConfig;
  private _server: ServerConfig;

  constructor() {
    this._environment = this.makeEnvironment();
    this._logger = this.makeLogger();
    this._server = this.makeServer();
  }

  public get environment(): EnvironmentConfig {
    return this._environment;
  }

  public get logger(): LoggerConfig {
    return this._logger;
  }

  public get server(): ServerConfig {
    return this._server;
  }

  private makeEnvironment(): EnvironmentConfig {
    const environment = global.apikit.environmentConfig;

    if (!environment) {
      throw new Error('Current environment is not defined.');
    }

    return environment;
  }

  private makeLogger(): LoggerConfig {
    const loggerConfig = global.apikit.loggerConfig;

    if (!loggerConfig) {
      throw new Error('Logger configuration is not defined.');
    }

    return loggerConfig;
  }

  private makeServer(): ServerConfig {
    const serverConfig = global.apikit.serverConfig;

    if (!serverConfig) {
      throw new Error('Server configuration is not defined.');
    }

    return serverConfig;
  }
}

// MARK: Private
type EnvironmentNames<T extends readonly EnvironmentConfig[]> =
  T extends readonly (infer U)[]
    ? U extends EnvironmentConfig
      ? U['name']
      : never
    : never;

interface ApiKitConfigInput<Environments extends readonly EnvironmentConfig[]> {
  outDir?: string;
  environments: Environments;
  server: { [K in EnvironmentNames<Environments>]: ServerConfig };
  logger: { [K in EnvironmentNames<Environments>]: LoggerConfig };
}
