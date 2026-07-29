import fs from 'node:fs';
import path from 'node:path';

import dotenvx from '@dotenvx/dotenvx';
import {
  type ResolveConfigurationOptions,
  loadAppBuild,
  loadAppConfig,
  resolveConfiguration,
  resolveConfigurationBinding,
} from '@internal/configuration';
import { ConsoleOutput } from '@internal/console';

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
  ServerConfiguration,
  StaticFilesConfiguration,
} from './configs';
import type { ConfigurationBinding } from '../core/configuration';
import type { EnvironmentConfig } from '../core/environments';
import { resolveEnvironment } from '../core/environments';

// MARK: - Public

export interface LoadApiKitContextOptions {
  readonly environment: string;
}

export async function loadApiKitContext(options: LoadApiKitContextOptions): Promise<void> {
  // MARK: App
  const loaded = await loadAppConfig();
  const buildConfiguration = await resolveConfiguration(BuildConfiguration, loaded.config.build);
  const build = await loadAppBuild(loaded.rootDir, buildConfiguration.outDir);

  // MARK: Environment
  const environment = resolveEnvironment(loaded.config.environments, options.environment, {
    fileDir: loaded.rootDir,
  });

  initializeEnvironment(environment);

  // MARK: Configuration
  const resolveOptions = {
    buildMetadata: build,
    environment: environment,
  };

  const server = await resolveConfiguration(ServerConfiguration, loaded.config.server, resolveOptions);
  const logger = await resolveConfiguration(LoggerConfiguration, loaded.config.logger, resolveOptions);
  const metrics = await resolveConfiguration(MetricsConfiguration, loaded.config.metrics, resolveOptions);
  const health = await resolveConfiguration(HealthConfiguration, loaded.config.health, resolveOptions);
  const email = await resolveConfiguration(EmailConfiguration, loaded.config.email, resolveOptions);
  const i18n = await resolveConfiguration(I18nConfiguration, loaded.config.i18n, resolveOptions);
  const staticFiles = await resolveConfiguration(StaticFilesConfiguration, loaded.config.staticFiles, resolveOptions);
  const basicAuth = await resolveConfiguration(BasicAuthConfiguration, loaded.config.basicAuth, resolveOptions);
  const cors = await resolveConfiguration(CorsConfiguration, loaded.config.cors, resolveOptions);
  const multipart = await resolveConfiguration(MultipartConfiguration, loaded.config.multipart, resolveOptions);
  const configurations = await resolveExtensions(loaded.config.configurations, resolveOptions);

  // MARK: Runtime
  global.apikit = {
    build: build,
    environmentConfig: environment,
    loggerConfig: logger,
    serverConfig: server,
    metricsConfig: metrics,
    healthConfig: health,
    emailConfig: email,
    i18nConfig: i18n,
    staticFilesConfig: staticFiles,
    basicAuthConfig: basicAuth,
    corsConfig: cors,
    multipartConfig: multipart,
    configurations: configurations,
  };

  ConsoleOutput.success(`[ApiKit] Context created for ${environment.name} environment`);
}

// MARK: - Private

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
