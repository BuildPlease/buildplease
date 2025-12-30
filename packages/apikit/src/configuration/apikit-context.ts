import fs from 'fs';
import path from 'path';

import dotenvx from '@dotenvx/dotenvx';

import { ApiKitConfigDefaults, loadConfig } from '@internal/configuration';
import { Logger } from '@internal/logger';

import type {
  ApiKitConfig,
  EmailConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
  I18nConfig,
  StaticFilesConfig,
} from '@/configuration';

/**
 * Options for creating an ApiKit context.
 *
 * @property {string} environment
 *   The environment name to initialize the context for.
 * @property {string} [configDir]
 *   The directory where configuration files are located. Defaults to `process.cwd()`.
 * @property {string} [configName]
 *   The name of the configuration file. Defaults to `'apikit.config'`.
 */
export interface MakeApikitContextOptions {
  environment: string;
  configDir?: string;
  configName?: string;
}

/**
 * Initializes the ApiKit context.
 *
 * Loads the configuration file, resolves the selected environment,
 * and registers context settings (logger, server, email, i18n, static files).
 *
 * @param options - Options for initializing the context.
 * @param options.environment - The target environment to load.
 * @param options.configDir - The directory containing the configuration file.
 *   @default process.cwd()
 * @param options.configName - The base name of the configuration file.
 *   @default "apikit.config"
 *
 * @returns A promise that resolves once the context is created.
 *
 * @throws {Error} If the config file, environment, or required sections are missing.
 */
export async function makeApikitContext(options: MakeApikitContextOptions): Promise<void> {
  const { environment, configDir, configName } = options;

  const config = await loadConfig(configDir, configName);
  const environmentConfig = await initializeEnvironment(config, environment);
  const loggerConfig = await initializeLogger(config, environmentConfig);
  const serverConfig = await initializeServer(config, environmentConfig);
  const emailConfig = await initializeEmail(config);
  const i18nConfig = await initializeI18n(config);
  const staticFilesConfig = await initializeStaticFiles(config);

  global.apikit = {
    isDebug: environmentConfig.debug ?? ApiKitConfigDefaults.isDebug,
    environmentConfig: environmentConfig,
    loggerConfig: loggerConfig,
    serverConfig: serverConfig,
    emailConfig: emailConfig,
    i18nConfig: i18nConfig,
    staticFilesConfig: staticFilesConfig,
  };

  Logger.success(`ApiKit context created for [${process.env.NODE_ENV?.toUpperCase()}] environment`);
}

/**
 * Initializes the environment by loading the corresponding `.env` file
 * and setting environment variables.
 *
 * @param {ApiKitConfig} config
 *   The loaded ApiKit configuration.
 * @param {string} envName
 *   The environment name to initialize.
 *
 * @returns {Promise<EnvironmentConfig>}
 *
 * @throws {Error}
 *   If the environment is not defined in the configuration, if the `.env` file
 *   does not exist, or if `NODE_ENV` does not match after loading.
 */
async function initializeEnvironment(config: ApiKitConfig, envName: string): Promise<EnvironmentConfig> {
  const environment = config.environments.find((env) => env.name === envName);

  if (!environment) {
    throw new Error(`Environment "${envName}" is not defined in config.`);
  }

  const environmentFilePath = path.resolve(environment.fileDir || process.cwd(), environment.file);

  if (!fs.existsSync(environmentFilePath)) {
    throw new Error(`Environment file "${environmentFilePath}" does not exist.`);
  }

  dotenvx.config({ path: environmentFilePath });
  process.env.NODE_ENV = environment.name;

  if (process.env.NODE_ENV !== environment.name) {
    throw new Error(`NODE_ENV mismatch: Expected "${environment.name}", got "${process.env.NODE_ENV}"`);
  }

  return environment;
}

/**
 * Initializes the logger configuration for the given environment.
 *
 * @param {ApiKitConfig} config
 *   The loaded ApiKit configuration.
 * @param {EnvironmentConfig} envConfig
 *   The resolved environment configuration.
 *
 * @returns {Promise<LoggerConfig>}
 *
 * @throws {Error}
 *   If the logger configuration is missing for the environment.
 */
async function initializeLogger(config: ApiKitConfig, envConfig: EnvironmentConfig): Promise<LoggerConfig> {
  const loggerConfig = config.logger[envConfig.name];
  if (!loggerConfig) {
    throw new Error(`Missing logger configuration for "${envConfig.name}"`);
  }
  return loggerConfig;
}

/**
 * Initializes the server configuration for the given environment.
 *
 * @param {ApiKitConfig} config
 *   The loaded ApiKit configuration.
 * @param {EnvironmentConfig} envConfig
 *   The resolved environment configuration.
 *
 * @returns {Promise<ServerConfig>}
 *
 * @throws {Error}
 *   If the server configuration is missing for the environment.
 */
async function initializeServer(config: ApiKitConfig, envConfig: EnvironmentConfig): Promise<ServerConfig> {
  const serverConfig = config.server[envConfig.name];
  if (!serverConfig) {
    throw new Error(`Missing server configuration for "${envConfig.name}"`);
  }
  return serverConfig;
}

/**
 * Initializes the email configuration.
 *
 * @param {ApiKitConfig} config
 *   The loaded ApiKit configuration.
 *
 * @returns {Promise<EmailConfig>}
 *
 * @throws {Error}
 *   If the email configuration is missing.
 */
async function initializeEmail(config: ApiKitConfig): Promise<EmailConfig> {
  const emailConfig = config.email;
  if (!emailConfig) {
    throw new Error(`Missing email configuration`);
  }
  return emailConfig;
}

/**
 * Retrieves the i18n configuration if defined.
 *
 * @param {ApiKitConfig} config
 *   The loaded ApiKit configuration.
 *
 * @returns {Promise<I18nConfig | undefined>}
 */
async function initializeI18n(config: ApiKitConfig): Promise<I18nConfig | undefined> {
  return config.i18n;
}

/**
 * Retrieves the static files configuration if defined.
 *
 * @param {ApiKitConfig} config
 *   The loaded ApiKit configuration.
 *
 * @returns {Promise<StaticFilesConfig | undefined>}
 */
async function initializeStaticFiles(config: ApiKitConfig): Promise<StaticFilesConfig | undefined> {
  return config.staticFiles;
}
