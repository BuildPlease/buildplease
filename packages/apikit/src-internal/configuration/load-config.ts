import fs from 'node:fs';

import { ensureDirectory, resolvePath } from '@meawkit/core/node';
import { createJiti } from 'jiti';

import type { ApiKitConfig } from '@/configuration';

const CONFIG_FILE_NAME = 'apikit.config';
const CONFIG_EXTENSIONS = ['', '.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', '.json'];

export interface ApiKitConfigurationLoadResult {
  readonly config: ApiKitConfig;
  readonly configFilePath: string;
  readonly rootDir: string;
}

/**
 * Loads the APIKit configuration and returns the resolved metadata used by CLI/build output.
 */
export async function loadApiKitConfiguration(
  dir?: string,
  configName?: string,
): Promise<ApiKitConfigurationLoadResult> {
  const rootDir = resolveRootDir(dir);
  const configFilePath = resolveConfigFilePath(rootDir, configName);

  try {
    const jiti = createJiti(rootDir, {
      interopDefault: true,
      extensions: CONFIG_EXTENSIONS.filter(Boolean),
    });

    const config = await jiti.import(configFilePath, {
      try: true,
      default: true,
    });

    return {
      config: assertApiKitConfig(config, configFilePath),
      configFilePath: configFilePath,
      rootDir: rootDir,
    };
  } catch (error) {
    throw new Error(`Failed to load config: ${error}`);
  }
}

/**
 * Loads the APIKit configuration file.
 */
export async function loadConfig(dir?: string, configName?: string): Promise<ApiKitConfig> {
  return (await loadApiKitConfiguration(dir, configName)).config;
}

function resolveRootDir(dir?: string): string {
  const rootDir = dir ? resolvePath(process.cwd(), dir) : process.cwd();

  ensureDirectory(rootDir);

  return rootDir;
}

function resolveConfigFilePath(rootDir: string, configName?: string): string {
  const configFilePath = resolvePath(rootDir, configName ?? CONFIG_FILE_NAME);

  for (const extension of CONFIG_EXTENSIONS) {
    const candidate = `${configFilePath}${extension}`;

    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return configFilePath;
}

function assertApiKitConfig(input: unknown, file: string): ApiKitConfig {
  if (!input || typeof input !== 'object') {
    throw new Error(`ApiKit config is missing (${file})`);
  }

  return input as ApiKitConfig;
}
