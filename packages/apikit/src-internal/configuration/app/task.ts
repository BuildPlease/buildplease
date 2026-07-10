import type { ApiKitConfig } from '@/configuration/app';

import type { ConfigTask } from '../loader';

export const appConfigTask: ConfigTask<ApiKitConfig> = {
  name: 'ApiKit app',
  configName: 'apikit.app.config',
  assert: assertAppConfig,
};

function assertAppConfig(input: unknown, filePath: string): ApiKitConfig {
  if (!input || typeof input !== 'object') {
    throw new Error(`ApiKit app config is missing (${filePath})`);
  }

  return input as ApiKitConfig;
}
