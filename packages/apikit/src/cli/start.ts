import fs from 'fs';
import path from 'path';

import dotenvx from '@dotenvx/dotenvx';
import { defineCommand } from 'citty';

import { loadConfig, log } from './utils';

import type {
  ApiKitConfig,
  EnvironmentConfig,
  LoggerConfig,
  ServerConfig,
} from '$/configuration';

export const startCommand = defineCommand({
  meta: {
    name: 'start',
    description: [
      'Start application in the specified environment',
      '',
      'Usage:',
      '  apikit start <environment> [--dir <directory>] [--config <config-name>]',
      '',
      'Examples:',
      '  apikit start development',
      '  apikit start production --dir ./deploy',
      '  apikit start staging -c custom.config -d ./configs',
    ].join('\n'),
  },
  args: {
    environment: {
      type: 'positional',
      description: 'The environment to start',
      required: true,
    },
    dir: {
      type: 'string',
      description: 'The directory to start the application from',
      required: false,
    },
    config: {
      type: 'string',
      name: 'config',
      description: [
        'The configuration file to use relative to the current working directory.',
        'By default, apikit tries to read `apikit.config` from the build `DIR` by default.',
      ].join('\n'),
      required: false,
    },
  },
  run: async ({ args }) => {
    try {
      const {
        environment: argEnvironmentName,
        dir: argDirPath,
        config: argConfigName,
      } = args;

      const apikitConfig = await loadConfig(argDirPath, argConfigName);

      const environmentConfig = await initializeEnvironment(
        apikitConfig,
        argEnvironmentName,
      );
      const loggerConfig = await initializeLogger(
        apikitConfig,
        environmentConfig,
      );
      const serverConfig = await initializeServer(
        apikitConfig,
        environmentConfig,
      );

      global.apikit = {
        config: apikitConfig,
        environmentConfig: environmentConfig,
        loggerConfig: loggerConfig,
        serverConfig: serverConfig,
      };

      log.success(
        `\n🚀 ApiKit successfully started in '${process.env.NODE_ENV}' environment`,
      );
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  },
});

// MARK: - Environment Initialization
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
    throw new Error(
      `Environment file "${environmentFilePath}" does not exist.`,
    );
  }

  process.env.NODE_ENV = environment.name;
  dotenvx.config({ path: environmentFilePath });

  if (process.env.NODE_ENV !== environment.name) {
    throw new Error(
      `NODE_ENV mismatch: Expected "${environment.name}", got "${process.env.NODE_ENV}"`,
    );
  }

  return environment;
}

// MARK: - Logger Initialization
async function initializeLogger(
  config: ApiKitConfig,
  env: EnvironmentConfig,
): Promise<LoggerConfig> {
  const environmentName = env.name;
  const loggerConfig = config.logger[environmentName];

  if (!loggerConfig) {
    throw new Error(`Missing logger configuration for "${environmentName}"`);
  }
  return loggerConfig;
}

// MARK: - Server Initialization
async function initializeServer(
  config: ApiKitConfig,
  env: EnvironmentConfig,
): Promise<ServerConfig> {
  const environmentName = env.name;
  const serverConfig = config.server[environmentName];

  if (!serverConfig) {
    throw new Error(`Missing server configuration for "${environmentName}"`);
  }
  return serverConfig;
}
