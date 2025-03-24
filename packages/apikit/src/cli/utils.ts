import { resolve } from 'path';
import { existsSync } from 'fs';

import { createJiti } from 'jiti';

import { ApiKitConfig } from '#/configuration/defineConfig';

export const log = {
  success: (message: string) => console.log('\x1b[32m' + message + '\x1b[0m'),
  info: (message: string) => console.log('\x1b[34m' + message + '\x1b[0m'),
  error: (message: string) =>
    console.error('\x1b[31m❌ Error: ' + message + '\x1b[0m'),
};

/**
 * Loads the APIKit configuration file.
 *
 * @param dir - (Optional) The base directory to look for the config.
 * @param configPath - (Optional) A specific config file path.
 * @returns Parsed ApiKitConfig
 */
export async function loadConfig(
  dir?: string,
  configPath?: string,
): Promise<ApiKitConfig> {
  const rootDir = resolve(process.cwd(), dir || '.');
  const configFile = configPath
    ? resolve(process.cwd(), configPath)
    : resolve(rootDir, 'apikit.config');

  if (!existsSync(rootDir)) {
    log.error(`Directory ${rootDir} does not exist.`);
    process.exit(1);
  }

  try {
    const jiti = createJiti(rootDir, { interopDefault: true });
    const config = await jiti.import(configFile);

    if (!config) {
      throw new Error('Invalid or missing configuration.');
    }

    return config as ApiKitConfig;
  } catch (error) {
    log.error(`Loading config: ${(error as Error).message}`);
    process.exit(1);
  }
}
