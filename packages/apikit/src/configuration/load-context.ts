import fs from 'node:fs';
import path from 'node:path';

import dotenvx from '@dotenvx/dotenvx';
import { Console } from '@meawkit/core/node';
import {
  type ResolveConfigurationOptions,
  loadApiKitConfig,
  loadAppBuild,
  resolveConfiguration,
  resolveConfigurationBinding,
} from '@src-internal/configuration';

import type { ApiKitConfig } from './config';
import {
  BasicAuthConfiguration,
  BuildConfiguration,
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
} from './configs';
import type { ConfigurationBinding } from './core/configuration';
import type { EnvironmentConfig } from './core/environments';
import { resolveEnvironment } from './core/environments';

const cli = new Console();

// MARK: - Public

export interface LoadApiKitContextOptions {
  readonly environment: string;
  readonly config?: string;
}

export async function loadApiKitContext(options: LoadApiKitContextOptions): Promise<void> {
  const loaded = await loadApiKitConfig({
    config: options.config,
  });
  const buildConfiguration = await resolveConfiguration(BuildConfiguration, loaded.config.build);
  const build = await loadAppBuild(loaded.rootDir, buildConfiguration.outDir);
  const environment = resolveEnvironment(loaded.config.environments, options.environment, {
    fileDir: loaded.rootDir,
  });

  initializeEnvironment(environment);

  const resolveOptions = {
    buildMetadata: build,
    environment: environment,
  };
  const configuration = await resolveApiKitConfigurations(loaded.config, resolveOptions);

  global.apikit = {
    build: build,
    environmentConfig: environment,
    ...configuration,
  };

  cli.success(`[ApiKit] Context created for ${environment.name} environment`);
}

// MARK: - Private

async function resolveApiKitConfigurations(config: ApiKitConfig, options: ResolveConfigurationOptions) {
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

function initializeEnvironment(environment: EnvironmentConfig): void {
  const environmentFilePath = path.resolve(environment.fileDir, environment.file);

  if (!fs.existsSync(environmentFilePath)) {
    throw new Error(`Environment file "${environmentFilePath}" does not exist.`);
  }

  dotenvx.config({ path: environmentFilePath });
  process.env.NODE_ENV = environment.name;
}
