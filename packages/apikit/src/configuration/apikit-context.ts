import fs from 'node:fs';
import path from 'node:path';

import dotenvx from '@dotenvx/dotenvx';
import { ConsoleOutput } from '@internal/console';

import type { EnvironmentConfig } from './core/environments';
import { loadConfig } from './core/load-config';
import { resolveRuntimeConfig, resolveRuntimeContext } from './core/resolve-apikit';

export interface LoadApikitContextOptions {
  readonly environment: string;
  readonly configDir?: string;
  readonly configName?: string;
}

export async function loadApikitContext(options: LoadApikitContextOptions): Promise<void> {
  const config = await loadConfig(options.configDir, options.configName);
  const context = await resolveRuntimeContext(config, options.environment);

  initializeEnvironment(context.environment);

  const resolved = await resolveRuntimeConfig(config, context);

  global.apikit = {
    environmentConfig: resolved.environment,
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

  ConsoleOutput.success(`[ApiKit] Context created for ${context.environment.name} environment`);
}

function initializeEnvironment(environment: EnvironmentConfig): void {
  const environmentFilePath = path.resolve(environment.fileDir, environment.file);

  if (!fs.existsSync(environmentFilePath)) {
    throw new Error(`Environment file "${environmentFilePath}" does not exist.`);
  }

  dotenvx.config({ path: environmentFilePath });
  process.env.NODE_ENV = environment.name;
}
