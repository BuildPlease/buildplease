import {
  type ConfigurationBinding,
  type ResolveConfigurationOptions,
  loadBuild,
  loadSelectedEnvironmentConfig,
  resolveConfiguration,
  resolveConfigurationBinding,
} from '@buildplease/core/node';

import type { ApiKitConfig } from '@/configuration/config';
import {
  BasicAuthConfiguration,
  CorsConfiguration,
  EmailConfiguration,
  HealthConfiguration,
  I18nConfiguration,
  LoggerConfiguration,
  MetricsConfiguration,
  MultipartConfiguration,
  NotificationConfiguration,
  ServerConfiguration,
  StaticFilesConfiguration,
} from '@/configuration/configs';

// MARK: - Internal

export async function initializeApiKitConfiguration(): Promise<void> {
  const build = await loadBuild();
  const loaded = await loadSelectedEnvironmentConfig<ApiKitConfig>();
  const input = loaded.config.input;
  const environment = loaded.environment;

  const resolveOptions = {
    build: build,
    environment: environment,
  };
  const configuration = await resolveApiKitConfigurations(input, resolveOptions);

  global.apikit = {
    build: build,
    environment: environment,
    ...configuration,
  };
}

// MARK: - Private

async function resolveApiKitConfigurations(config: ApiKitConfig['input'], options: ResolveConfigurationOptions) {
  return {
    serverConfig: await resolveConfiguration(ServerConfiguration, config.server, options),
    loggerConfig: await resolveConfiguration(LoggerConfiguration, config.logger, options),
    metricsConfig: await resolveConfiguration(MetricsConfiguration, config.metrics, options),
    healthConfig: await resolveConfiguration(HealthConfiguration, config.health, options),
    emailConfig: await resolveConfiguration(EmailConfiguration, config.email, options),
    notificationConfig: await resolveConfiguration(NotificationConfiguration, config.notification, options),
    i18nConfig: await resolveConfiguration(I18nConfiguration, config.i18n, options),
    staticFilesConfig: await resolveConfiguration(StaticFilesConfiguration, config.staticFiles, options),
    basicAuthConfig: await resolveConfiguration(BasicAuthConfiguration, config.basicAuth, options),
    corsConfig: await resolveConfiguration(CorsConfiguration, config.cors, options),
    multipartConfig: await resolveConfiguration(MultipartConfiguration, config.multipart, options),
    configurations: await resolveExtensions(config.configurations, options),
  };
}

async function resolveExtensions(
  bindings: readonly ConfigurationBinding[],
  options: ResolveConfigurationOptions,
): Promise<ReadonlyMap<string, unknown>> {
  const configurations = new Map<string, unknown>();

  for (const binding of bindings) {
    if (binding.contract.key.startsWith('apikit.')) {
      throw new Error(`Configuration key "${binding.contract.key}" is reserved for ApiKit.`);
    }

    if (configurations.has(binding.contract.key)) {
      throw new Error(`Configuration "${binding.contract.key}" is registered more than once.`);
    }

    configurations.set(binding.contract.key, await resolveConfigurationBinding(binding, options));
  }

  return configurations;
}
