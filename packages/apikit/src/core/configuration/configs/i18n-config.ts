export interface I18nDirEntry {
  /**
   * Path to a folder containing JSON translation files.
   *
   * Files must follow the format: `<locale>.json`, e.g., `en.json`, `sk.json`.
   *
   * @example './src/locales'
   */
  path: string;
}

export interface I18nFileEntry {
  /**
   * Path to a single JSON translation file.
   *
   * @example './src/locales/sk.json'
   */
  path: string;

  /**
   * The language code this file represents.
   *
   * @example 'sk'
   */
  locale: string;
}

export interface I18nConfig {
  /**
   * Directories containing multiple translation files.
   *
   * All `.json` files will be automatically loaded and inferred as locale files.
   *
   * @example [{ path: './src/locales' }]
   */
  directories?: I18nDirEntry[];

  /**
   * Individual translation files mapped to specific language codes.
   * These can override or extend directory-based files.
   *
   * @example [{ locale: 'sk', path: './overrides/sk.json' }]
   */
  files?: I18nFileEntry[];

  /**
   * Language code to use as fallback when no translation is found.
   *
   * @default 'en'
   */
  defaultLanguage?: string;

  /**
   * List of language codes to preload at startup.
   * Must include `defaultLanguage`.
   *
   * @default ['en', 'sk', 'cs']
   */
  supportedLanguages?: string[];

  /**
   * Optional list of namespaces to register (e.g., ['common', 'errors']).
   *
   * @default ['translation']
   */
  namespaces?: string[];

  /**
   * The default namespace used when calling `t()` without specifying one.
   *
   * @default 'translation'
   */
  defaultNamespace?: string;

  /**
   * Enables debug logging during i18next initialization.
   *
   * @default false
   */
  debug?: boolean;
}
