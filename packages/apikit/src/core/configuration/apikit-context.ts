import fs from 'fs';
import path from 'path';

import dotenvx from '@dotenvx/dotenvx';

import { loadConfig, log } from '@/utils';

import type {
  ApiKitConfig,
  EmailConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
  I18nConfig,
  StaticFilesConfig,
} from '#/configuration';

/**
 * Options for creating an ApiKit context.
 */
export interface MakeApikitContextOptions {
  /**
   * The environment name to initialize the context for.
   */
  environment: string;

  /**
   * The directory where configuration files are located.
   * @default process.cwd()
   */
  configDir?: string;

  /**
   * The name of the configuration file.
   * @default 'apikit.config'
   */
  configName?: string;
}

/**
 * Initializes the ApiKit context for the given environment and configuration.
 * It loads configuration files, sets up environment variables, logger, and server configurations,
 * then sets the global `apikit` context for the application.
 *
 * @param options - The options to configure the context.
 * @returns Void
 */
export async function makeApikitContext({
  environment,
  configDir,
  configName,
}: MakeApikitContextOptions): Promise<void> {
  const config = await loadConfig(configDir, configName);
  const environmentConfig = await initializeEnvironment(config, environment);
  const loggerConfig = await initializeLogger(config, environmentConfig);
  const serverConfig = await initializeServer(config, environmentConfig);
  const emailConfig = await initializeEmail(config);
  const i18nConfig = await initializeI18n(config);
  const staticFilesConfig = await initializeStaticFiles(config);

  global.apikit = {
    config: config,
    environmentConfig: environmentConfig,
    loggerConfig: loggerConfig,
    serverConfig: serverConfig,
    emailConfig: emailConfig,
    i18nConfig: i18nConfig,
    staticFilesConfig: staticFilesConfig,
  };

  log.success(`\n🚀 ApiKit context created for '${process.env.NODE_ENV}' environment`);
}

/**
 * Initializes the environment by loading the corresponding `.env` file and setting the environment variables.
 *
 * @throws Error if the environment is not found or the .env file does not exist.
 */
async function initializeEnvironment(
  config: ApiKitConfig,
  envName: string,
): Promise<EnvironmentConfig> {
  const environment = config.environments.find((env) => env.name === envName);

  if (!environment) {
    throw new Error(`Environment "${envName}" is not defined in config.`);
  }

  const environmentFilePath = path.resolve(
    environment.fileDir || process.cwd(),
    `.env.${environment.name}`,
  );

  if (!fs.existsSync(environmentFilePath)) {
    throw new Error(`Environment file "${environmentFilePath}" does not exist.`);
  }

  dotenvx.config({ path: environmentFilePath });
  process.env.NODE_ENV = environment.name;

  if (process.env.NODE_ENV !== environment.name) {
    throw new Error(
      `NODE_ENV mismatch: Expected "${environment.name}", got "${process.env.NODE_ENV}"`,
    );
  }

  return environment;
}

/**
 * Initializes the logger configuration for the given environment.
 *
 * @throws Error if the logger configuration is missing for the environment.
 */
async function initializeLogger(
  config: ApiKitConfig,
  env: EnvironmentConfig,
): Promise<LoggerConfig> {
  const loggerConfig = config.logger[env.name];
  if (!loggerConfig) throw new Error(`Missing logger configuration for "${env.name}"`);
  return loggerConfig;
}

/**
 * Initializes the server configuration for the given environment.
 *
 * @throws Error if the server configuration is missing for the environment.
 */
async function initializeServer(
  config: ApiKitConfig,
  env: EnvironmentConfig,
): Promise<ServerConfig> {
  const serverConfig = config.server[env.name];
  if (!serverConfig) throw new Error(`Missing server configuration for "${env.name}"`);
  return serverConfig;
}

/**
 * Initializes the email configuration for the given environment.
 *
 * @throws Error if the email configuration is missing for the environment.
 */
async function initializeEmail(config: ApiKitConfig): Promise<EmailConfig> {
  const emailConfig = config.email;
  if (!emailConfig) throw new Error(`Missing email configuration`);
  return emailConfig;
}

/**
 * Returns i18n config if defined.
 */
async function initializeI18n(config: ApiKitConfig): Promise<I18nConfig | undefined> {
  return config.i18n;
}

/**
 * Returns static files config if defined.
 */
async function initializeStaticFiles(config: ApiKitConfig): Promise<StaticFilesConfig | undefined> {
  return config.staticFiles;
}
