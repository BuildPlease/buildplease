import {
  type ApiKitConfig,
  type BasicAuthConfig,
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
import { resolveEnvironment } from './environments';
import { clearResolvedConfigurations, hasResolvedConfiguration, setResolvedConfiguration } from './registry';
import {
  type ResolveConfigurationOptions,
  resolveConfigurationBinding,
  resolveConfigurationContract,
} from './resolve-configuration';

export interface ApiKitRuntimeContext {
  readonly environment: EnvironmentConfig;

  readonly packageJson?: {
    readonly name?: string;
    readonly version?: string;
  };
}

export interface ResolvedApiKitConfig {
  readonly environment: EnvironmentConfig;

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

export function resolveRuntimeContext(
  config: ApiKitConfig,
  environmentName: string,
  packageJson?: ApiKitRuntimeContext['packageJson'],
): ApiKitRuntimeContext {
  const environment = resolveEnvironment(config.environments, environmentName);

  return {
    environment,
    packageJson,
  };
}

export async function resolveRuntimeConfig(
  config: ApiKitConfig,
  context: ApiKitRuntimeContext,
): Promise<ResolvedApiKitConfig> {
  clearResolvedConfigurations();

  const resolveOptions = makeResolveOptions(context);

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
    environment: context.environment,
    server,
    logger,
    metrics,
    health,
    email,
    i18n,
    staticFiles,
    basicAuth,
    cors,
    multipart,
  };
}

function makeResolveOptions(context: ApiKitRuntimeContext): ResolveConfigurationOptions {
  if (context.packageJson) {
    return {
      environment: context.environment,
      packageJson: context.packageJson,
    };
  }

  return {
    environment: context.environment,
  };
}
