import { resolveConfiguration } from '@internal/configuration';

import { type ApiKitConfig, type I18nConfig, BuildConfiguration, I18nConfiguration } from '@/configuration';

import type { GeneratorConfig } from './generator-config';
import type { I18nGenerationConfig } from './i18n-generator-config';

export interface AppGeneratorConfig extends GeneratorConfig {
  readonly i18n: I18nGenerationConfig;
}

export async function resolveAppGeneratorConfig(config: ApiKitConfig): Promise<AppGeneratorConfig> {
  const build = await resolveConfiguration(BuildConfiguration, config.build, {});
  const i18n = await resolveConfiguration(I18nConfiguration, config.i18n, {});

  return {
    build: build,
    i18n: makeI18nGeneratorConfig(i18n),
  };
}

function makeI18nGeneratorConfig(config: I18nConfig): I18nGenerationConfig {
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
