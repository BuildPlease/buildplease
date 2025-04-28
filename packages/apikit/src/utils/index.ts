import { existsSync } from 'fs';

import { createJiti } from 'jiti';

import type { ApiKitConfig } from '#/configuration';
import { resolvePath } from '#/utils';

export const log = {
  success: (message: string) => console.log('\x1b[32m' + message + '\x1b[0m'),
  info: (message: string) => console.log('\x1b[34m' + message + '\x1b[0m'),
  error: (message: string) => console.error('\x1b[31m❌ Error: ' + message + '\x1b[0m'),
};

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

  if (!existsSync(rootDir)) {
    throw new Error(`Directory ${rootDir} does not exist`);
  }

  const configFile = configName
    ? resolvePath(rootDir, configName)
    : resolvePath(rootDir, 'apikit.config');

  try {
    const jiti = createJiti(rootDir, {
      interopDefault: true,
      extensions: ['.js', '.cjs', '.mjs', '.ts', '.cts', '.mts', '.json'],
    });

    const config = await jiti.import(configFile, {
      try: true,
      default: true,
    });

    if (!config) {
      throw new Error(`No configuration found at ${configFile}`);
    }

    return config as ApiKitConfig;
  } catch (error) {
    throw new Error(`Failed to load config: ${error}`);
  }
}
