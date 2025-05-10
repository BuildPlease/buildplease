import fs from 'node:fs';
import path from 'node:path';

import { injectable } from 'inversify';
import i18next, { type ReadCallback } from 'i18next';
import Backend from 'i18next-fs-backend';
import { merge } from 'lodash';

export interface LocalizationFileEntry {
  /**
   * Absolute or relative path to the JSON file containing translations.
   *
   * @example './locales/en.json'
   */
  path: string;

  /**
   * The locale code this file represents (e.g. 'en', 'sk', 'de').
   *
   * @example 'en'
   */
  locale: string;
}

export interface LocalizationConfigurationOptions {
  /**
   * Custom localization files to be merged into the i18n store.
   * These override or extend the built-in framework translations.
   *
   * @default []
   */
  locales?: LocalizationFileEntry[];

  /**
   * The default language to use for translation fallback.
   *
   * @default 'en'
   */
  defaultLanguage?: string;

  /**
   * List of all locales to preload into memory.
   * Must include the defaultLanguage if used.
   *
   * @default ['en']
   */
  supportedLanguages?: string[];

  /**
   * Enables debug logging for i18next initialization.
   *
   * @default false
   */
  debug?: boolean;
}

export interface LocalizationController {
  prepare(options?: LocalizationConfigurationOptions): Promise<void>;
}

@injectable()
export class LocalizationControllerImpl implements LocalizationController {
  private readonly builtinLocalesDir = path.resolve(__dirname, 'locales');

  public async prepare(options: LocalizationConfigurationOptions = {}): Promise<void> {
    const {
      locales = [],
      defaultLanguage = 'en',
      supportedLanguages = ['en'],
      debug = false,
    } = options;

    const allLocales: LocalizationFileEntry[] = [...this.resolveBuiltinLocales(), ...locales];

    const translations = this.buildTranslationMap(allLocales);
    const LOAD_PATH_TEMPLATE = '{{lng}}.json';

    await i18next.use(Backend).init({
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,
      preload: supportedLanguages,
      debug,
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

  private resolveBuiltinLocales(): LocalizationFileEntry[] {
    const entries: LocalizationFileEntry[] = [];

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

  private buildTranslationMap(locales: LocalizationFileEntry[]): Record<string, any> {
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

      merge(translations, { [locale]: json });
    }

    return translations;
  }
}
