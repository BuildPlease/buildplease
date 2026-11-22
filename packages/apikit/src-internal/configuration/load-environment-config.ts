import fs from 'node:fs';

import { type ConfigDefinition, ensureDirectory, isConfigDefinition, resolvePath } from '@buildplease/core/node';
import { createJiti } from 'jiti';

const ENVIRONMENT_CONFIG_FILE = 'environment.config.ts';

export interface LoadEnvironmentConfigOptions {
  readonly dir?: string;
}

export interface LoadedConfig<Config extends ConfigDefinition = ConfigDefinition> {
  readonly config: Config;
  readonly configFilePath: string;
  readonly rootDir: string;
}

export async function loadEnvironmentConfig<Config extends ConfigDefinition = ConfigDefinition>(
  options: LoadEnvironmentConfigOptions = {},
): Promise<LoadedConfig<Config>> {
  return loadEnvironmentConfigInternal<Config>(options);
}

async function loadEnvironmentConfigInternal<Config extends ConfigDefinition>(
  options: LoadEnvironmentConfigOptions,
): Promise<LoadedConfig<Config>> {
  const rootDir = resolveRootDir(options.dir);

  try {
    const configFilePath = resolvePath(rootDir, ENVIRONMENT_CONFIG_FILE);

    if (!fs.existsSync(configFilePath)) {
      throw new Error(`Config file "${configFilePath}" does not exist.`);
    }

    const config = await loadConfigExport(rootDir, configFilePath);

    if (!isConfigDefinition(config)) {
      throw new Error(`Environment config is invalid (${configFilePath}).`);
    }

    return {
      config: config as Config,
      configFilePath: configFilePath,
      rootDir: rootDir,
    };
  } catch (error) {
    throw makeLoadError(error);
  }
}

function resolveRootDir(dir?: string): string {
  const rootDir = dir ? resolvePath(process.cwd(), dir) : process.cwd();

  ensureDirectory(rootDir);

  return rootDir;
}

async function loadConfigExport(rootDir: string, configFilePath: string): Promise<unknown> {
  const jiti = createJiti(rootDir, {
    interopDefault: true,
    extensions: ['.ts'],
    tsconfigPaths: true,
  });

  return jiti.import(configFilePath, { default: true });
}

function makeLoadError(error: unknown): Error {
  return new Error(`Failed to load environment.config.ts: ${error instanceof Error ? error.message : String(error)}`, {
    cause: error,
  });
}
