import type { InitOptions } from 'i18next';

export interface I18nDirEntry {
  /**
   * Directory containing locale files.
   *
   * @required
   *
   * @example "./src/locales"
   */
  path: string;

  /**
   * Namespace assigned to all locale files from this directory.
   *
   * @optional
   * @default defaultNamespace
   *
   * @example "errors"
   */
  namespace?: string;
}

export interface I18nFileEntry {
  /**
   * Locale code represented by this file.
   *
   * @required
   *
   * @example "sk"
   */
  locale: string;

  /**
   * Path to the locale file.
   *
   * @required
   *
   * @example "./src/locales/sk.json"
   */
  path: string;

  /**
   * Namespace assigned to this locale file.
   *
   * @optional
   * @default defaultNamespace
   *
   * @example "common"
   */
  namespace?: string;
}

export interface I18nConfig {
  /**
   * Locale directories to load.
   *
   * Will load all `.json` files and infer locales from filenames.
   *
   * @optional
   * @default []
   */
  directories?: I18nDirEntry[];

  /**
   * Individual locale files to load.
   *
   * @optional
   * @default []
   */
  files?: I18nFileEntry[];

  /**
   * Default language used by i18next.
   *
   * @optional
   * @default "en"
   */
  defaultLanguage?: InitOptions['lng'];

  /**
   * Supported languages accepted by i18next.
   *
   * Must include `defaultLanguage`.
   *
   * @optional
   * @default ["en", "sk", "cs"]
   */
  supportedLanguages?: Exclude<InitOptions['supportedLngs'], false>;

  /**
   * Fallback language resolution used when a translation is missing.
   *
   * @optional
   * @default same as defaultLanguage
   */
  fallbackLanguages?: InitOptions['fallbackLng'];

  /**
   * Enables matching of base language codes for region-specific locales.
   *
   * @optional
   * @default true
   */
  nonExplicitSupportedLngs?: InitOptions['nonExplicitSupportedLngs'];

  /**
   * Controls how language codes are loaded.
   *
   * @optional
   * @default "languageOnly"
   */
  load?: InitOptions['load'];

  /**
   * Languages preloaded during i18next initialization.
   *
   * @optional
   * @default false
   */
  preload?: InitOptions['preload'];

  /**
   * Lowercases full locale codes.
   *
   * @optional
   * @default false
   */
  lowerCaseLng?: InitOptions['lowerCaseLng'];

  /**
   * Normalizes language codes.
   *
   * @optional
   * @default false
   */
  cleanCode?: InitOptions['cleanCode'];

  /**
   * Translation namespaces registered in i18next.
   *
   * @optional
   * @default ["translation"]
   */
  namespaces?: InitOptions['ns'];

  /**
   * Default namespace used for translation lookup.
   *
   * @optional
   * @default "translation"
   */
  defaultNamespace?: string;

  /**
   * Separator used for nested translation keys.
   *
   * @optional
   * @default "."
   */
  keySeparator?: InitOptions['keySeparator'];

  /**
   * Separator used between namespace and translation key.
   *
   * @optional
   * @default ":"
   */
  nsSeparator?: InitOptions['nsSeparator'];

  /**
   * Separator used for plural translation variants.
   *
   * @optional
   * @default "_"
   */
  pluralSeparator?: InitOptions['pluralSeparator'];

  /**
   * Separator used for contextual translation variants.
   *
   * @optional
   * @default "_"
   */
  contextSeparator?: InitOptions['contextSeparator'];
}
