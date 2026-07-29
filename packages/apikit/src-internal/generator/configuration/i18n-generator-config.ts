import { ApiKitI18nDefaults } from '@internal/configuration/i18n';

import type { ApiKitI18nConfig, ApiKitI18nSource } from '@/configuration/i18n';

import type { GeneratorConfig } from './generator-config';

export interface I18nGeneratorDirectoryEntry {
  readonly path: string;
}

export interface I18nGeneratorFileEntry {
  readonly locale: string;
  readonly path: string;
}

export interface I18nGenerationConfig {
  readonly name?: string;
  readonly extends?: ApiKitI18nSource;
  readonly directories: readonly I18nGeneratorDirectoryEntry[];
  readonly files: readonly I18nGeneratorFileEntry[];
  readonly defaultLanguage: string;
  readonly keySeparator: string;
  readonly includeBuiltinResources: boolean;
  readonly emitSource: boolean;
}

export interface I18nGeneratorConfig extends GeneratorConfig {
  readonly i18n: I18nGenerationConfig;
}

export function resolveI18nGeneratorConfig(config: ApiKitI18nConfig): I18nGeneratorConfig {
  const defaults = ApiKitI18nDefaults;
  const build = config.build ?? {};
  const resources = config.resources ?? {};

  return {
    build: {
      outDir: build.outDir ?? defaults.build.outDir,
    },
    i18n: {
      name: config.name,
      extends: config.extends,
      directories: resources.directories ?? [...defaults.resources.directories],
      files: resources.files ?? [...defaults.resources.files],
      defaultLanguage: config.referenceLanguage ?? defaults.referenceLanguage,
      keySeparator: defaults.keySeparator,
      includeBuiltinResources: false,
      emitSource: true,
    },
  };
}
