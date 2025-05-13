import fs from 'node:fs';

import { inject, injectable } from 'inversify';
import i18next from 'i18next';
import merge from 'lodash.merge';

import { ApiKitSymbols } from '#/di';
import { resolvePath } from '#/utils';
import type { LoggerController } from '#/logger';
import type { ApiKitController, I18nConfig, I18nFileEntry } from '#/configuration';

export interface I18nController {
  /**
   * Initializes i18next with merged built-in and app-provided translations.
   */
  prepare(): Promise<void>;

  /**
   * Extracts the base language from an Accept-Language string.
   *
   * @example "sk-SK,sk;q=0.8" → "sk"
   */
  parseLocale(header?: string): string | undefined;
}

@injectable()
export class I18nControllerImpl implements I18nController {
  constructor(
    @inject(ApiKitSymbols.DI.Logger.Controller)
    private logger: LoggerController,
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private readonly configuration: ApiKitController,
  ) {}

  public async prepare(): Promise<void> {
    const config = this.prepareConfig();
    const translations = this.makeTranslations(config);

    await i18next.init({
      lng: config.defaultLanguage,
      fallbackLng: config.defaultLanguage,
      preload: config.supportedLanguages,
      resources: translations,
      ns: config.namespaces,
      defaultNS: config.defaultNamespace,
      debug: config.debug,
    });
  }

  public parseLocale(input?: string): string | undefined {
    if (!input) return undefined;

    const raw = input.split(',')[0]?.trim().toLowerCase();
    if (!raw) return undefined;

    const [lang] = raw.split('-');
    return lang;
  }

  // MARK: - Private

  private prepareConfig(): Required<I18nConfig> {
    const i18nConfig = this.configuration.i18n ?? {};
    return {
      directories: [],
      files: [],
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'sk', 'cs'],
      namespaces: ['translation'],
      defaultNamespace: 'translation',
      debug: false,
      ...i18nConfig,
    };
  }

  private makeTranslations(config: Required<I18nConfig>): Record<string, any> {
    const entries: I18nFileEntry[] = [];

    // MARK: - Built-in framework locales
    const builtinLocales = resolvePath(import.meta.url, './locales');
    entries.push(...this.resolveLocalesFromDir(builtinLocales));

    // MARK: - Consumer-defined directories
    for (const dirEntry of config.directories ?? []) {
      entries.push(...this.resolveLocalesFromDir(resolvePath('.', dirEntry.path)));
    }

    // MARK: - Consumer-defined files
    for (const file of config.files ?? []) {
      entries.push({
        locale: file.locale,
        path: resolvePath('.', file.path),
      });
    }

    const merged = this.mergeLocales(entries);

    if (config.debug) {
      this.logger.debug('i18n merged translations', {
        content: {
          entries: entries,
          mergedLanguages: Object.keys(merged),
        },
      });
    }

    return merged;
  }

  private resolveLocalesFromDir(dir: string): I18nFileEntry[] {
    if (!fs.existsSync(dir)) return [];

    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith('.json'))
      .map((file) => ({
        locale: file.replace('.json', ''),
        path: resolvePath(dir, file),
      }));
  }

  private mergeLocales(entries: I18nFileEntry[]): Record<string, any> {
    const translations: Record<string, any> = {};

    for (const { locale, path: filePath } of entries) {
      const abs = filePath;

      if (!fs.existsSync(abs)) {
        throw new Error(`[i18n] Missing file: ${abs}`);
      }

      try {
        const content = JSON.parse(fs.readFileSync(abs, 'utf-8'));
        merge(translations, { [locale]: content });
      } catch {
        throw new Error(`[i18n] Invalid JSON in: ${abs}`);
      }
    }

    return translations;
  }
}
