import { ApiKitConfigDefaults } from '@internal/configuration';

import type {
  ApiKitConfig,
  ConsoleTransportOptions,
  EmailConfig,
  EnvironmentConfig,
  FileTransportOptions,
  I18nConfig,
  LoggerConfig,
  MetricsConfig,
  ServerConfig,
  StaticFilesConfig,
} from '@/configuration';

// MARK: - Input types

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type EnvironmentConfigInput = WithOptional<EnvironmentConfig, 'debug' | 'fileDir'>;

type ServerConfigInput = WithOptional<ServerConfig, 'trustProxy'>;

type ConsoleTransportOptionsInput = WithOptional<ConsoleTransportOptions, 'level' | 'pretty'>;

type FileTransportOptionsInput = WithOptional<FileTransportOptions, 'level'>;

type TransportOptionsInput = ConsoleTransportOptionsInput | FileTransportOptionsInput;

type MetricsConfigInput = WithOptional<MetricsConfig, 'enabled' | 'endpoint'>;

type EmailConfigInput = WithOptional<EmailConfig, 'templatesPath' | 'globals'>;

type LoggerConfigInput = WithOptional<
  Omit<LoggerConfig, 'transports'> & {
    transports: TransportOptionsInput[];
  },
  'disabled' | 'transports'
>;

type StaticFilesConfigInput = WithOptional<
  StaticFilesConfig,
  'enabled' | 'routePrefix' | 'maxAge' | 'dotfiles' | 'etag' | 'immutable' | 'decorateReply' | 'preCompressed'
>;

// MARK: - Environment-based config mapping

type EnvironmentNames<T extends readonly EnvironmentConfigInput[]> = T extends readonly (infer U)[]
  ? U extends EnvironmentConfigInput
    ? U['name']
    : never
  : never;

type EnvironmentBasedConfig<Environments extends readonly EnvironmentConfigInput[], Value> = {
  [K in EnvironmentNames<Environments>]: Value;
};

// MARK: - Public API

export interface ApiKitConfigInput<Environments extends readonly EnvironmentConfigInput[]> {
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
  server: EnvironmentBasedConfig<Environments, ServerConfigInput>;

  /**
   * @see {@link ApiKitConfig.logger}
   */
  logger?: Partial<EnvironmentBasedConfig<Environments, LoggerConfigInput>>;

  /**
   * @see {@link ApiKitConfig.metrics}
   */
  metrics?: Partial<EnvironmentBasedConfig<Environments, MetricsConfigInput>>;

  /**
   * @see {@link ApiKitConfig.email}
   */
  email: EmailConfigInput;

  /**
   * @see {@link ApiKitConfig.i18n}
   */
  i18n?: I18nConfig;

  /**
   * @see {@link ApiKitConfig.staticFiles}
   */
  staticFiles?: StaticFilesConfigInput;
}

export function defineApikitConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
): ApiKitConfig {
  const environmentNames = validateEnvironmentConfig(config);

  validateServerConfig(config, environmentNames);

  const outDir = config.outDir ?? ApiKitConfigDefaults.outDir;
  const environments = makeEnvironmentConfig(config);
  const server = makeServerConfig(config, environmentNames);
  const logger = makeLoggerConfig(config, environmentNames);
  const metrics = makeMetricsConfig(config, environmentNames);
  const email = makeEmailConfig(config);
  const staticFiles = makeStaticFilesConfig(config);

  return {
    outDir: outDir,
    environments: environments,
    server: server,
    logger: logger,
    metrics: metrics,
    email: email,
    i18n: config.i18n,
    staticFiles: staticFiles,
  };
}

// MARK: - Validation

function validateEnvironmentConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
): EnvironmentNames<Environments>[] {
  if (!config.environments.length) {
    throw new Error('At least one environment must be defined.');
  }

  const names = new Set<string>();
  const environmentNames: EnvironmentNames<Environments>[] = [];

  for (const environment of config.environments) {
    const name = environment.name.trim() as EnvironmentNames<Environments>;
    const file = environment.file.trim();

    if (!name) throw new Error('Environment name must not be empty.');
    if (!file) throw new Error(`Environment file must not be empty for "${environment.name}".`);
    if (names.has(name)) throw new Error(`Environment name "${name}" is duplicated.`);

    names.add(name);
    environmentNames.push(name);
  }

  return environmentNames;
}

function validateServerConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
  environmentNames: EnvironmentNames<Environments>[],
): void {
  const identifiers = new Set<string>();

  for (const name of environmentNames) {
    const server = config.server[name];

    if (!server) throw new Error(`Missing server configuration for "${name}".`);

    const identifier = server.identifier.trim();

    if (!identifier) throw new Error(`Server identifier must not be empty for "${name}".`);
    if (identifiers.has(identifier)) throw new Error(`Server identifier "${identifier}" is duplicated.`);

    identifiers.add(identifier);
  }
}

// MARK: - Private

function makeEnvironmentConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
): EnvironmentConfig[] {
  const defaults = ApiKitConfigDefaults.environment;

  return config.environments.map((environment) => ({
    debug: environment.debug ?? defaults.debug,
    name: environment.name.trim(),
    file: environment.file.trim(),
    fileDir: environment.fileDir?.trim() || defaults.fileDir,
  }));
}

function makeServerConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
  environmentNames: EnvironmentNames<Environments>[],
): Record<string, ServerConfig> {
  const result: Record<string, ServerConfig> = {};
  const defaults = ApiKitConfigDefaults.server.config;

  for (const name of environmentNames) {
    const input = config.server[name];

    result[name] = {
      identifier: input.identifier.trim(),
      trustProxy: input.trustProxy ?? defaults.trustProxy,
    };
  }

  return result;
}

function makeLoggerConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
  environmentNames: EnvironmentNames<Environments>[],
): Record<string, LoggerConfig> {
  const result: Record<string, LoggerConfig> = {};
  const defaults = ApiKitConfigDefaults.logger.config;
  const defaultLevel = ApiKitConfigDefaults.logger.defaultLevel;

  for (const name of environmentNames) {
    const input = config.logger?.[name];
    const transports = input?.transports ?? defaults.transports;

    result[name] = {
      disabled: input?.disabled ?? defaults.disabled,
      transports: transports.map((transport) => {
        switch (transport.type) {
          case 'console':
            return {
              type: 'console',
              target: transport.target,
              level: transport.level ?? defaultLevel,
              pretty: transport.pretty ?? {},
            };

          case 'file':
            return {
              type: 'file',
              envPathKey: transport.envPathKey,
              level: transport.level ?? defaultLevel,
            };
        }
      }),
    };
  }

  return result;
}

function makeMetricsConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
  environmentNames: EnvironmentNames<Environments>[],
): Record<string, MetricsConfig> {
  const result: Record<string, MetricsConfig> = {};
  const defaults = ApiKitConfigDefaults.metrics.config;

  for (const name of environmentNames) {
    const input = config.metrics?.[name];

    result[name] = {
      enabled: input?.enabled ?? defaults.enabled,
      endpoint: input?.endpoint ?? defaults.endpoint,
    };
  }

  return result;
}

function makeEmailConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
): EmailConfig {
  const defaults = ApiKitConfigDefaults.email.config;
  const input = config.email;

  return {
    enabled: input.enabled,
    templatesPath: input.templatesPath ?? defaults.templatesPath,
    globals: {
      ...defaults.globals,
      ...(input.globals ?? {}),
    },
  };
}

function makeStaticFilesConfig<const Environments extends readonly EnvironmentConfigInput[]>(
  config: ApiKitConfigInput<Environments>,
): StaticFilesConfig | undefined {
  const input = config.staticFiles;

  if (!input) return undefined;

  const defaults = ApiKitConfigDefaults.staticFiles.config;

  return {
    enabled: input.enabled ?? defaults.enabled,
    rootPath: input.rootPath,
    routePrefix: input.routePrefix ?? defaults.routePrefix,
    maxAge: input.maxAge ?? defaults.maxAge,
    dotfiles: input.dotfiles ?? defaults.dotfiles,
    etag: input.etag ?? defaults.etag,
    immutable: input.immutable ?? defaults.immutable,
    decorateReply: input.decorateReply ?? defaults.decorateReply,
    preCompressed: input.preCompressed ?? defaults.preCompressed,
  };
}
