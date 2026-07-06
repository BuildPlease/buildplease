import {
  type ApiKitConfig,
  type BuildConfig,
  type I18nConfig,
  BuildConfiguration,
  I18nConfiguration,
} from '@/configuration';
import { resolveConfigurationContract } from '@/configuration/core/resolve-configuration';

import type { I18nGeneratorConfig } from './i18n-generator-config';

export interface ApiKitGeneratorConfig {
  readonly build: BuildConfig;
  readonly i18n: I18nGeneratorConfig;
}

export async function resolveApiKitGeneratorConfig(config: ApiKitConfig): Promise<ApiKitGeneratorConfig> {
  const build = await resolveConfigurationContract(BuildConfiguration, config.build, {});
  const i18n = await resolveConfigurationContract(I18nConfiguration, config.i18n, {});

  return {
    build,
    i18n: makeI18nGeneratorConfig(i18n),
  };
}

function makeI18nGeneratorConfig(config: I18nConfig): I18nGeneratorConfig {
  return {
    directories: config.directories,
    files: config.files,
    defaultLanguage: config.defaultLanguage,
    defaultNamespace: config.defaultNamespace,
    nsSeparator: config.nsSeparator,
    keySeparator: config.keySeparator,
  };
}
