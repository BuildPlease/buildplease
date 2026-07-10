import {
  type ApiKitConfig,
  type BuildConfig,
  type I18nConfig,
  BuildConfiguration,
  I18nConfiguration,
} from '@/configuration';
import { resolveConfigurationContract } from '@/configuration/core/resolve-configuration';

import type { I18nGeneratorConfig } from './i18n-generator-config';

export interface AppGeneratorConfig {
  readonly build: BuildConfig;
  readonly i18n: I18nGeneratorConfig;
}

export async function resolveAppGeneratorConfig(config: ApiKitConfig): Promise<AppGeneratorConfig> {
  const build = await resolveConfigurationContract(BuildConfiguration, config.build, {});
  const i18n = await resolveConfigurationContract(I18nConfiguration, config.i18n, {});

  return {
    build: build,
    i18n: makeI18nGeneratorConfig(i18n),
  };
}

function makeI18nGeneratorConfig(config: I18nConfig): I18nGeneratorConfig {
  return {
    name: undefined,
    extends: undefined,
    directories: config.directories.map((directory) => ({
      path: directory.path,
    })),
    files: config.files.map((file) => ({
      locale: file.locale,
      path: file.path,
    })),
    defaultLanguage: config.defaultLanguage,
    keySeparator: config.keySeparator,
    includeBuiltinResources: true,
    emitSource: false,
  };
}
