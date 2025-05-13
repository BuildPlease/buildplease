import fs from 'node:fs';
import path from 'node:path';

import { inject, injectable } from 'inversify';
import i18next, { type ReadCallback } from 'i18next';
import Backend from 'i18next-fs-backend';
import merge from 'lodash.merge';

import { ApiKitSymbols } from '#/di';
import type { ApiKitController, I18nConfig, I18nFileEntry } from '#/configuration';

export interface LocalizationController {
  prepare(): Promise<void>;
}

@injectable()
export class LocalizationControllerImpl implements LocalizationController {
  private readonly builtinLocalesDir = path.resolve(__dirname, 'locales');

  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private readonly configuration: ApiKitController,
  ) {}

  public async prepare(): Promise<void> {
    const config = this.prepareConfig();

    const builtinLocales = this.resolveBuiltinLocales();
    const allLocales: I18nFileEntry[] = [...builtinLocales, ...config.locales];

    const translations = this.buildTranslationMap(allLocales);
    const LOAD_PATH_TEMPLATE = '{{lng}}.json';

    await i18next.use(Backend).init({
      lng: config.defaultLanguage,
      fallbackLng: config.defaultLanguage,
      preload: config.supportedLanguages,
      debug: config.debug,
      backend: {
        loadPath: LOAD_PATH_TEMPLATE,
        read: (lng: string, _ns: string, callback: ReadCallback) => {
          const data = translations[lng];
          if (data) return callback(null, data);
          return callback(new Error(`[i18n] Missing translations for locale "${lng}"`), false);
        },
      },
    });
  }

  // MARK: - Private

  private prepareConfig(): Required<I18nConfig> {
    const i18nConfig = this.configuration.i18n ?? {};

    const defaultI18nConfig: Required<I18nConfig> = {
      locales: [],
      defaultLanguage: 'en',
      supportedLanguages: ['en'],
      debug: false,
    };

    return {
      ...defaultI18nConfig,
      ...i18nConfig,
    };
  }

  private resolveBuiltinLocales(): I18nFileEntry[] {
    const entries: I18nFileEntry[] = [];

    const files = fs.readdirSync(this.builtinLocalesDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const locale = file.replace('.json', '');
      entries.push({
        locale,
        path: path.join(this.builtinLocalesDir, file),
      });
    }

    return entries;
  }

  private buildTranslationMap(locales: I18nFileEntry[]): Record<string, any> {
    const translations: Record<string, any> = {};

    for (const { path: filePath, locale } of locales) {
      const resolvedPath = path.resolve(filePath);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`[i18n] Missing localization file: ${resolvedPath}`);
      }

      const content = fs.readFileSync(resolvedPath, 'utf-8');
      let json: any;

      try {
        json = JSON.parse(content);
      } catch {
        throw new Error(`[i18n] Invalid JSON in file: ${resolvedPath}`);
      }

      // Merge custom values into base, respecting override
      merge(translations, { [locale]: json });
    }

    return translations;
  }
}
