import type { ApiKitConfig } from '@/configuration';

import { type LoadConfigFileOptions, loadConfigFile } from './load-config-file';

export const APIKIT_CONFIG_NAME = 'apikit.config';

export async function loadApiKitConfig(options: LoadConfigFileOptions = {}) {
  return loadConfigFile<ApiKitConfig>(
    {
      name: 'ApiKit',
      defaultName: APIKIT_CONFIG_NAME,
      validate: validateApiKitConfig,
    },
    options,
  );
}

function validateApiKitConfig(input: unknown, filePath: string): ApiKitConfig {
  if (!input || typeof input !== 'object') {
    throw new Error(`ApiKit config is missing (${filePath})`);
  }

  return input as ApiKitConfig;
}
