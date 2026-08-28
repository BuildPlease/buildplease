import fs from 'node:fs';
import { dirname } from 'node:path';

import dotenvx from '@dotenvx/dotenvx';
import { createJiti } from 'jiti';

import { type ConfigDefinition, isConfigDefinition } from './configuration';
import { type EnvironmentConfigFromRegistry, resolveEnvironment } from './environment';
import { ensureDirectory, resolvePath } from '../file/file-sync';

const CONFIG_EXTENSIONS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'] as const;

export const ENVIRONMENT_CONFIG_FILE = 'environment.config.ts';

export interface LoadConfigOptions {
  readonly dir?: string;
  readonly config?: string;
  readonly environment?: string;
}

export interface LoadedConfig<Config extends ConfigDefinition = ConfigDefinition> {
  readonly config: Config;
  readonly configFilePath: string;
  readonly rootDir: string;
  readonly environment?: EnvironmentConfigFromRegistry<Config['environments']>;
}

export interface LoadedEnvironmentConfig<
  Config extends ConfigDefinition = ConfigDefinition,
> extends LoadedConfig<Config> {
  readonly environment: EnvironmentConfigFromRegistry<Config['environments']>;
}

export function loadConfig<Config extends ConfigDefinition = ConfigDefinition>(
  options: LoadConfigOptions & { readonly environment: string },
): Promise<LoadedEnvironmentConfig<Config>>;
export function loadConfig<Config extends ConfigDefinition = ConfigDefinition>(
  options?: LoadConfigOptions,
): Promise<LoadedConfig<Config>>;
export async function loadConfig<Config extends ConfigDefinition = ConfigDefinition>(
  options: LoadConfigOptions = {},
): Promise<LoadedConfig<Config>> {
  const rootDir = resolveRootDir(options.dir);

  try {
    const configFilePath = resolveConfigFilePath(rootDir, options.config ?? ENVIRONMENT_CONFIG_FILE);
    const config = await loadConfigExport(rootDir, configFilePath);

    if (!isConfigDefinition(config)) {
      throw new Error(`Environment config must be defined with defineConfig() (${configFilePath}).`);
    }

    const typedConfig = config as Config;
    const environment = options.environment
      ? resolveEnvironment(typedConfig.environments, options.environment, { baseDir: dirname(configFilePath) })
      : undefined;

    if (environment) initializeEnvironment(environment);

    return {
      config: typedConfig,
      configFilePath: configFilePath,
      rootDir: rootDir,
      environment: environment as EnvironmentConfigFromRegistry<Config['environments']> | undefined,
    };
  } catch (error) {
    throw new Error(`Failed to load environment config: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function resolveRootDir(dir?: string): string {
  const rootDir = dir ? resolvePath(process.cwd(), dir) : process.cwd();

  ensureDirectory(rootDir);

  return rootDir;
}

function resolveConfigFilePath(rootDir: string, configName: string): string {
  const configFilePath = resolvePath(rootDir, configName);

  if (fs.existsSync(configFilePath)) return configFilePath;

  if (!CONFIG_EXTENSIONS.some((extension) => configName.endsWith(extension))) {
    for (const extension of CONFIG_EXTENSIONS) {
      const candidate = `${configFilePath}${extension}`;

      if (fs.existsSync(candidate)) return candidate;
    }
  }

  throw new Error(`Config file "${configFilePath}" does not exist.`);
}

async function loadConfigExport(rootDir: string, configFilePath: string): Promise<unknown> {
  const jiti = createJiti(rootDir, {
    interopDefault: true,
    extensions: [...CONFIG_EXTENSIONS],
    tsconfigPaths: true,
  });

  return jiti.import(configFilePath, { default: true });
}

function initializeEnvironment(environment: {
  readonly name: string;
  readonly file: string;
  readonly fileDir: string;
}): void {
  const environmentFilePath = resolvePath(environment.fileDir, environment.file);

  if (!fs.existsSync(environmentFilePath)) {
    throw new Error(`Environment file "${environmentFilePath}" does not exist.`);
  }

  dotenvx.config({ path: environmentFilePath });
  process.env.NODE_ENV = environment.name;
}
