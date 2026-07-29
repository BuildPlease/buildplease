import type { ApiKitConfig } from '@/configuration/app';

import { type LoadConfigFileOptions, loadConfigFile } from '../load-config-file';

const APP_CONFIG_NAME = 'apikit.app.config';

export async function loadAppConfig(options: LoadConfigFileOptions = {}) {
  return loadConfigFile<ApiKitConfig>(
    {
      name: 'ApiKit app',
      defaultName: APP_CONFIG_NAME,
      validate: validateAppConfig,
    },
    options,
  );
}

function validateAppConfig(input: unknown, filePath: string): ApiKitConfig {
  if (!input || typeof input !== 'object') {
    throw new Error(`ApiKit app config is missing (${filePath})`);
  }

  return input as ApiKitConfig;
}
