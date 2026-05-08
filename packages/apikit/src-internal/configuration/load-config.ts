import { ensureDirectory, resolvePath } from '@meawkit/core/node';
import { createJiti } from 'jiti';

import type { ApiKitConfig } from '@/configuration';

/**
 * Loads the APIKit configuration file.
 *
 * @param dir - (Optional) The base directory to look for the config.
 * @param configName - (Optional) A name of config file path.
 * @returns Parsed ApiKitConfig
 */
export async function loadConfig(dir?: string, configName?: string): Promise<ApiKitConfig> {
  const cwd = process.cwd();
  const rootDir = dir ? resolvePath(cwd, dir) : cwd;

  ensureDirectory(rootDir);

  const configFile = configName ? resolvePath(rootDir, configName) : resolvePath(rootDir, 'apikit.config');

  try {
    const jiti = createJiti(rootDir, {
      interopDefault: true,
      extensions: ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts', '.json'],
    });

    const config = await jiti.import(configFile, {
      try: true,
      default: true,
    });

    return assertApiKitConfig(config, configFile);
  } catch (error) {
    throw new Error(`Failed to load config: ${error}`);
  }
}

function assertApiKitConfig(input: unknown, file: string): ApiKitConfig {
  if (input == null) throw new Error(`ApiKit config is missing (${file})`);
  return input as ApiKitConfig;
}
