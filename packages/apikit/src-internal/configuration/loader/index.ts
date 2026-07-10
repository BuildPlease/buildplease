import fs from 'node:fs';

import { ensureDirectory, resolvePath } from '@meawkit/core/node';
import { createJiti } from 'jiti';

const CONFIG_EXTENSIONS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', '.json'] as const;

export interface ConfigTask<Config> {
  readonly name: string;
  readonly configName: string;
  readonly assert: (input: unknown, filePath: string) => Config;
}

export interface LoadConfigOptions {
  readonly dir?: string;
  readonly config?: string;
}

export interface LoadedConfig<Config> {
  readonly config: Config;
  readonly configFilePath: string;
  readonly rootDir: string;
}

export async function loadConfigForTask<Config>(
  task: ConfigTask<Config>,
  options: LoadConfigOptions = {},
): Promise<LoadedConfig<Config>> {
  const rootDir = resolveRootDir(options.dir);
  const configFilePath = resolveConfigFilePath(rootDir, options.config ?? task.configName);

  try {
    const config = await loadConfigExport<unknown>(rootDir, configFilePath);

    return {
      config: task.assert(config, configFilePath),
      configFilePath: configFilePath,
      rootDir: rootDir,
    };
  } catch (error) {
    throw new Error(`Failed to load ${task.name} config: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function resolveRootDir(dir?: string): string {
  const rootDir = dir ? resolvePath(process.cwd(), dir) : process.cwd();

  ensureDirectory(rootDir);

  return rootDir;
}

function resolveConfigFilePath(rootDir: string, configName: string): string {
  const configFilePath = resolvePath(rootDir, configName);

  for (const extension of CONFIG_EXTENSIONS) {
    const candidate = `${configFilePath}${extension}`;

    if (fs.existsSync(candidate)) return candidate;
  }

  return configFilePath;
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
