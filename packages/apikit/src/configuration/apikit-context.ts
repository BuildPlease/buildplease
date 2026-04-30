import fs from 'fs';
import path from 'path';

import dotenvx from '@dotenvx/dotenvx';
import { loadConfig } from '@internal/configuration';
import { Consola } from '@internal/consola';

import type {
  ApiKitConfig,
  EmailConfig,
  EnvironmentConfig,
  I18nConfig,
  LoggerConfig,
  MetricsConfig,
  ServerConfig,
  StaticFilesConfig,
} from '@/configuration';

export interface loadApikitContextOptions {
  environment: string;
  configDir?: string;
  configName?: string;
}

export async function loadApikitContext(options: loadApikitContextOptions): Promise<void> {
  const { environment, configDir, configName } = options;
  const config = await loadConfig(configDir, configName);

  const environmentConfig = await initializeEnvironment(config, environment);
  const loggerConfig = await loadLoggerConfig(config, environmentConfig);
  const serverConfig = await loadServerConfig(config, environmentConfig);
  const metricsConfig = await loadMetricsConfig(config, environmentConfig);
  const emailConfig = await loadEmailConfig(config);
  const i18nConfig = await loadI18nConfig(config);
  const staticFilesConfig = await loadStaticFilesConfig(config);

  global.apikit = {
    isDebug: environmentConfig.debug,
    environmentConfig: environmentConfig,
    loggerConfig: loggerConfig,
    serverConfig: serverConfig,
    metricsConfig: metricsConfig,
    emailConfig: emailConfig,
    i18nConfig: i18nConfig,
    staticFilesConfig: staticFilesConfig,
  };

  Consola.success(`ApiKit context created for [${process.env.NODE_ENV?.toUpperCase()}] environment`);
}

async function initializeEnvironment(config: ApiKitConfig, envName: string): Promise<EnvironmentConfig> {
  const environment = config.environments.find((env) => env.name === envName);

  if (!environment) {
    throw new Error(`Environment "${envName}" is not defined in config.`);
  }

  const environmentFilePath = path.resolve(environment.fileDir, environment.file);

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

async function loadLoggerConfig(config: ApiKitConfig, envConfig: EnvironmentConfig): Promise<LoggerConfig> {
  const loggerConfig = config.logger[envConfig.name];

  if (!loggerConfig) {
    throw new Error(`Missing logger configuration for "${envConfig.name}"`);
  }

  return loggerConfig;
}

async function loadServerConfig(config: ApiKitConfig, envConfig: EnvironmentConfig): Promise<ServerConfig> {
  const serverConfig = config.server[envConfig.name];

  if (!serverConfig) {
    throw new Error(`Missing server configuration for "${envConfig.name}"`);
  }

  return serverConfig;
}

async function loadMetricsConfig(config: ApiKitConfig, envConfig: EnvironmentConfig): Promise<MetricsConfig> {
  const metricsConfig = config.metrics[envConfig.name];

  if (!metricsConfig) {
    throw new Error(`Missing metrics configuration for "${envConfig.name}"`);
  }

  return metricsConfig;
}

async function loadEmailConfig(config: ApiKitConfig): Promise<EmailConfig> {
  const emailConfig = config.email;

  if (!emailConfig) {
    throw new Error('Missing email configuration');
  }

  return emailConfig;
}

async function loadI18nConfig(config: ApiKitConfig): Promise<I18nConfig | undefined> {
  return config.i18n;
}

async function loadStaticFilesConfig(config: ApiKitConfig): Promise<StaticFilesConfig | undefined> {
  return config.staticFiles;
}
