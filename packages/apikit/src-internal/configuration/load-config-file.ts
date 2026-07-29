import fs from 'node:fs';

import { ensureDirectory, resolvePath } from '@meawkit/core/node';
import { createJiti } from 'jiti';

const CONFIG_EXTENSIONS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', '.json'] as const;

export interface ConfigFileDefinition<Config> {
  readonly name: string;
  readonly defaultName: string;
  readonly validate: (input: unknown, filePath: string) => Config;
}

export interface LoadConfigFileOptions {
  readonly dir?: string;
  readonly config?: string;
}

export interface LoadedConfigFile<Config> {
  readonly config: Config;
  readonly configFilePath: string;
  readonly rootDir: string;
}

export async function loadConfigFile<Config>(
  definition: ConfigFileDefinition<Config>,
  options: LoadConfigFileOptions = {},
): Promise<LoadedConfigFile<Config>> {
  const rootDir = resolveRootDir(options.dir);
  const configFilePath = resolveConfigFilePath(rootDir, options.config ?? definition.defaultName);

  try {
    const config = await loadConfigExport(rootDir, configFilePath);

    return {
      config: definition.validate(config, configFilePath),
      configFilePath: configFilePath,
      rootDir: rootDir,
    };
  } catch (error) {
    throw new Error(
      `Failed to load ${definition.name} config: ${error instanceof Error ? error.message : String(error)}`,
    );
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

async function loadConfigExport(rootDir: string, configFilePath: string): Promise<unknown> {
  const jiti = createJiti(rootDir, {
    interopDefault: true,
    extensions: [...CONFIG_EXTENSIONS],
  });

  return jiti.import(configFilePath, {
    try: true,
    default: true,
  });
}
