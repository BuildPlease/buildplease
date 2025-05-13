export interface I18nFileEntry {
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

export interface I18nConfig {
  /**
   * Custom localization files to be merged into the i18n store.
   * These override or extend the built-in framework translations.
   *
   * @default []
   */
  locales?: I18nFileEntry[];

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
