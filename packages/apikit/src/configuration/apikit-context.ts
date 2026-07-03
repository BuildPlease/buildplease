import fs from 'node:fs';
import path from 'node:path';

import dotenvx from '@dotenvx/dotenvx';
import { ConsoleOutput } from '@internal/console';

import { type EnvironmentConfig, resolveEnvironment } from './core/environments';
import { loadConfig } from './core/load-config';
import { resolveApikit, resolveBuildConfiguration } from './core/resolve-apikit';

// MARK: - Public

export interface LoadApikitContextOptions {
  readonly environment: string;
  readonly configDir?: string;
  readonly configName?: string;
}

export async function loadApikitContext(options: LoadApikitContextOptions): Promise<void> {
  const definition = await loadConfig(options.configDir, options.configName);

  const buildConfig = await resolveBuildConfiguration(definition, options.environment);
  const environmentConfig = resolveEnvironment(definition.environments, options.environment, {
    fileDir: buildConfig.environmentFileDir,
  });

  initializeEnvironment(environmentConfig);

  const resolved = await resolveApikit(definition, {
    environment: environmentConfig,
  });

  global.apikit = {
    environmentConfig: resolved.environment,
    buildConfig: resolved.build,
    loggerConfig: resolved.logger,
    serverConfig: resolved.server,
    metricsConfig: resolved.metrics,
    healthConfig: resolved.health,
    emailConfig: resolved.email,
    i18nConfig: resolved.i18n,
    staticFilesConfig: resolved.staticFiles,
    basicAuthConfig: resolved.basicAuth,
    corsConfig: resolved.cors,
    multipartConfig: resolved.multipart,
  };

  ConsoleOutput.success(`[ApiKit] Context created for ${environmentConfig.name} environment`);
}

// MARK: - Private

function initializeEnvironment(environment: EnvironmentConfig): void {
  const environmentFilePath = path.resolve(environment.fileDir, environment.file);

  if (!fs.existsSync(environmentFilePath)) {
    throw new Error(`Environment file "${environmentFilePath}" does not exist.`);
  }

  dotenvx.config({ path: environmentFilePath });
  process.env.NODE_ENV = environment.name;
}
