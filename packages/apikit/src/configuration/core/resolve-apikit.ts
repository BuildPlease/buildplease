import {
  type ApiKitConfig,
  type ApiKitRuntimeConfig,
  type BasicAuthConfig,
  type CorsConfig,
  type EmailConfig,
  type I18nConfig,
  type LoggerConfig,
  type MetricsConfig,
  type MultipartConfig,
  type ServerConfig,
  type StaticFilesConfig,
  ApiKitRuntimeConfiguration,
  BasicAuthConfiguration,
  CorsConfiguration,
  EmailConfiguration,
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
  readonly runtime: ApiKitRuntimeConfig;
  readonly environment: EnvironmentConfig;

  readonly basicAuth: BasicAuthConfig;
  readonly cors: CorsConfig;
  readonly server: ServerConfig;
  readonly logger: LoggerConfig;
  readonly metrics: MetricsConfig;
  readonly multipart: MultipartConfig;
  readonly email: EmailConfig;
  readonly i18n: I18nConfig;
  readonly staticFiles: StaticFilesConfig;
}

// MARK: - Internal

export async function resolveRuntimeConfiguration(
  config: ApiKitConfig,
  environmentName: string,
): Promise<ApiKitRuntimeConfig> {
  const environment: EnvironmentConfig = {
    name: environmentName,
    file: '',
    fileDir: process.cwd(),
  };

  return resolveConfigurationContract(ApiKitRuntimeConfiguration, config.runtime, {
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

  const cors = await resolveConfigurationContract(CorsConfiguration, config.cors, resolveOptions);
  const server = await resolveConfigurationContract(ServerConfiguration, config.server, resolveOptions);
  const logger = await resolveConfigurationContract(LoggerConfiguration, config.logger, resolveOptions);
  const metrics = await resolveConfigurationContract(MetricsConfiguration, config.metrics, resolveOptions);
  const email = await resolveConfigurationContract(EmailConfiguration, config.email, resolveOptions);
  const i18n = await resolveConfigurationContract(I18nConfiguration, config.i18n, resolveOptions);
  const staticFiles = await resolveConfigurationContract(
    StaticFilesConfiguration,
    config.staticFiles,
    resolveOptions,
  );
  const basicAuth = await resolveConfigurationContract(
    BasicAuthConfiguration,
    config.basicAuth,
    resolveOptions,
  );
  const multipart = await resolveConfigurationContract(
    MultipartConfiguration,
    config.multipart,
    resolveOptions,
  );
  const runtime = await resolveConfigurationContract(
    ApiKitRuntimeConfiguration,
    config.runtime,
    resolveOptions,
  );

  for (const binding of config.configurations) {
    if (hasResolvedConfiguration(binding.contract)) {
      throw new Error('Configuration is registered more than once.');
    }

    const value = await resolveConfigurationBinding(binding, resolveOptions);

    setResolvedConfiguration(binding.contract, value);
  }

  return {
    runtime: runtime,
    environment: options.environment,
    server: server,
    logger: logger,
    metrics: metrics,
    email: email,
    i18n: i18n,
    staticFiles: staticFiles,
    basicAuth: basicAuth,
    cors: cors,
    multipart: multipart,
  };
}
