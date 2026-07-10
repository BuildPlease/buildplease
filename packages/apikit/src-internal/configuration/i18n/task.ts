import type { ApiKitI18nConfig } from '@/configuration/i18n';

import type { ConfigTask } from '../loader';

export const i18nConfigTask: ConfigTask<ApiKitI18nConfig> = {
  name: 'ApiKit i18n',
  configName: 'apikit.i18n.config',
  assert: assertI18nConfig,
};

function assertI18nConfig(input: unknown, filePath: string): ApiKitI18nConfig {
  if (!input || typeof input !== 'object') {
    throw new Error(`ApiKit i18n config is missing (${filePath})`);
  }

  return input as ApiKitI18nConfig;
}
