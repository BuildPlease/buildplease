import {
  type ApiKitConfig,
  type BasicAuthConfig,
  type BuildConfig,
  type CorsConfig,
  type EmailConfig,
  type HealthConfig,
  type I18nConfig,
  type LoggerConfig,
  type MetricsConfig,
  type MultipartConfig,
  type ServerConfig,
  type StaticFilesConfig,
  BasicAuthConfiguration,
  BuildConfiguration,
  CorsConfiguration,
  EmailConfiguration,
  HealthConfiguration,
  I18nConfiguration,
  LoggerConfiguration,
  MetricsConfiguration,
  MultipartConfiguration,
  ServerConfiguration,
  StaticFilesConfiguration,
} from '@/configuration';

import type { EnvironmentConfig } from './environments';
import { clearResolvedConfigurations, hasResolvedConfiguration, setResolvedConfiguration } from './registry';
import { resolveConfigurationBinding, resolveConfigurationContract } from './resolve-configuration';

// MARK: - Public

export interface ResolveApikitOptions {
  readonly environment: EnvironmentConfig;

  readonly packageJson?: {
    readonly name?: string;
    readonly version?: string;
  };
}

export interface ResolvedApiKitConfig {
  readonly environment: EnvironmentConfig;
  readonly build: BuildConfig;

  readonly basicAuth: BasicAuthConfig;
  readonly cors: CorsConfig;
  readonly server: ServerConfig;
  readonly logger: LoggerConfig;
  readonly metrics: MetricsConfig;
  readonly health: HealthConfig;
  readonly multipart: MultipartConfig;
  readonly email: EmailConfig;
  readonly i18n: I18nConfig;
  readonly staticFiles: StaticFilesConfig;
}

// MARK: - Internal

export async function resolveBuildConfiguration(config: ApiKitConfig, environmentName: string): Promise<BuildConfig> {
  const environmentDefinition = config.environments[environmentName];

  if (!environmentDefinition) {
    const message = `Unknown environment "${environmentName}". Expected one of ${Object.keys(config.environments).join(', ')}.`;
    throw new Error(message);
  }

  const environment: EnvironmentConfig = {
    name: environmentName,
    file: environmentDefinition.file,
    fileDir: environmentDefinition.fileDir ?? process.cwd(),
  };

  return resolveConfigurationContract(BuildConfiguration, config.build, {
    environment: environment,
  });
}

export async function resolveApikit(
  config: ApiKitConfig,
  options: ResolveApikitOptions,
): Promise<ResolvedApiKitConfig> {
  clearResolvedConfigurations();

  const resolveOptions = {
    environment: options.environment,
    packageJson: options.packageJson,
  };

  const build = await resolveConfigurationContract(BuildConfiguration, config.build, resolveOptions);
  const cors = await resolveConfigurationContract(CorsConfiguration, config.cors, resolveOptions);
  const server = await resolveConfigurationContract(ServerConfiguration, config.server, resolveOptions);
  const logger = await resolveConfigurationContract(LoggerConfiguration, config.logger, resolveOptions);
  const metrics = await resolveConfigurationContract(MetricsConfiguration, config.metrics, resolveOptions);
  const health = await resolveConfigurationContract(HealthConfiguration, config.health, resolveOptions);
  const email = await resolveConfigurationContract(EmailConfiguration, config.email, resolveOptions);
  const i18n = await resolveConfigurationContract(I18nConfiguration, config.i18n, resolveOptions);
  const staticFiles = await resolveConfigurationContract(StaticFilesConfiguration, config.staticFiles, resolveOptions);
  const basicAuth = await resolveConfigurationContract(BasicAuthConfiguration, config.basicAuth, resolveOptions);
  const multipart = await resolveConfigurationContract(MultipartConfiguration, config.multipart, resolveOptions);

  for (const binding of config.configurations) {
    if (binding.contract.key.startsWith('apikit.')) {
      throw new Error(`Configuration key "${binding.contract.key}" is reserved for ApiKit.`);
    }

    if (hasResolvedConfiguration(binding.contract)) {
      throw new Error(`Configuration "${binding.contract.key}" is registered more than once.`);
    }

    const value = await resolveConfigurationBinding(binding, resolveOptions);

    setResolvedConfiguration(binding.contract, value);
  }

  return {
    environment: options.environment,
    build: build,
    server: server,
    logger: logger,
    metrics: metrics,
    health: health,
    email: email,
    i18n: i18n,
    staticFiles: staticFiles,
    basicAuth: basicAuth,
    cors: cors,
    multipart: multipart,
  };
}
