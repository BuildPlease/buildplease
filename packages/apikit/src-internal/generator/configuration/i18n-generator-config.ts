import { ApiKitI18nDefaults } from '@internal/configuration/i18n';

import type { ApiKitI18nConfig, ApiKitI18nSource } from '@/configuration/i18n';

export interface I18nGeneratorDirectoryEntry {
  readonly path: string;
}

export interface I18nGeneratorFileEntry {
  readonly locale: string;
  readonly path: string;
}

export interface I18nGeneratorConfig {
  readonly name?: string;
  readonly extends?: ApiKitI18nSource;
  readonly directories: readonly I18nGeneratorDirectoryEntry[];
  readonly files: readonly I18nGeneratorFileEntry[];
  readonly defaultLanguage: string;
  readonly keySeparator: string;
  readonly includeBuiltinResources: boolean;
  readonly emitSource: boolean;
}

export interface ApiKitI18nGeneratorConfig {
  readonly build: {
    readonly outDir: string;
  };
  readonly i18n: I18nGeneratorConfig;
}

export function resolveApiKitI18nGeneratorConfig(config: ApiKitI18nConfig): ApiKitI18nGeneratorConfig {
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
