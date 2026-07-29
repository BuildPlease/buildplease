import type { ApiKitI18nConfig } from '@/configuration/i18n';

import { type LoadConfigFileOptions, loadConfigFile } from '../load-config-file';

const I18N_CONFIG_NAME = 'apikit.i18n.config';

export async function loadI18nConfig(options: LoadConfigFileOptions = {}) {
  return loadConfigFile<ApiKitI18nConfig>(
    {
      name: 'ApiKit i18n',
      defaultName: I18N_CONFIG_NAME,
      validate: validateI18nConfig,
    },
    options,
  );
}

function validateI18nConfig(input: unknown, filePath: string): ApiKitI18nConfig {
  if (!input || typeof input !== 'object') {
    throw new Error(`ApiKit i18n config is missing (${filePath})`);
  }

  return input as ApiKitI18nConfig;
}
