import fs from 'node:fs';

import { ensureDirectory, resolvePath } from '@buildplease/core/node';
import { createJiti } from 'jiti';

import type { DevKitConfig } from '../../src/configuration';
import { defineDevKitConfig } from '../../src/configuration';

const CONFIG_EXTENSIONS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', '.json'] as const;
const CONFIG_NAME = 'devkit.config';

export interface LoadDevKitConfigOptions {
  readonly dir?: string;
  readonly config?: string;
}

export interface LoadedDevKitConfig {
  readonly config: DevKitConfig;
  readonly configFilePath?: string;
  readonly rootDir: string;
}

export async function loadDevKitConfig(options: LoadDevKitConfigOptions = {}): Promise<LoadedDevKitConfig> {
  const rootDir = resolveRootDir(options.dir);
  const configFilePath = resolveConfigFilePath(rootDir, options.config ?? CONFIG_NAME);

  if (!configFilePath) {
    return {
      config: defineDevKitConfig(),
      rootDir: rootDir,
    };
  }

  try {
    const config = await loadConfigExport<unknown>(rootDir, configFilePath);

    return {
      config: assertDevKitConfig(config, configFilePath),
      configFilePath: configFilePath,
      rootDir: rootDir,
    };
  } catch (error) {
    throw new Error(`Failed to load DevKit config: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function resolveRootDir(dir?: string): string {
  const rootDir = dir ? resolvePath(process.cwd(), dir) : process.cwd();

  ensureDirectory(rootDir);

  return rootDir;
}

function resolveConfigFilePath(rootDir: string, configName: string): string | undefined {
  const configFilePath = resolvePath(rootDir, configName);

  for (const extension of CONFIG_EXTENSIONS) {
    const candidate = `${configFilePath}${extension}`;

    if (fs.existsSync(candidate)) return candidate;
  }

  return undefined;
}

async function loadConfigExport<Config>(rootDir: string, configFilePath: string): Promise<Config> {
  const jiti = createJiti(rootDir, {
    interopDefault: true,
    extensions: [...CONFIG_EXTENSIONS],
  });

  return jiti.import(configFilePath, {
    try: true,
    default: true,
  }) as Promise<Config>;
}

function assertDevKitConfig(input: unknown, filePath: string): DevKitConfig {
  if (!input || typeof input !== 'object') {
    throw new Error(`DevKit config is missing (${filePath})`);
  }

  return defineDevKitConfig(input as DevKitConfig);
}
