import type { InitOptions } from 'i18next';

export interface I18nDirEntry {
  /**
   * Path to a folder of locale JSON files.
   * @example './src/locales'
   */
  path: string;

  /**
   * Namespace to assign to all files in this directory.
   * @default defaultNamespace
   * @example 'errors'
   */
  namespace?: string;
}

export interface I18nFileEntry {
  /**
   * The language code this file represents.
   * @example 'sk'
   */
  locale: string;

  /**
   * Path to a single translation file.
   * @example './src/locales/sk.json'
   */
  path: string;

  /**
   * Namespace to assign to this file.
   * @default defaultNamespace
   * @example 'common'
   */
  namespace?: string;
}

export interface I18nConfig {
  /**
   * Directories containing multiple translation files.
   * The framework will load all `.json` files and infer their locales from filenames.
   * @default []
   */
  directories?: I18nDirEntry[];

  /**
   * Individual translation files mapped to specific locales.
   * Can override or extend directory-based files.
   * @default []
   */
  files?: I18nFileEntry[];

  /**
   * Default language to initialize i18next with (InitOptions['lng']).
   * Also used as fallback when a translation is missing in the requested locale.
   * @default 'en'
   */
  defaultLanguage?: InitOptions['lng'];

  /**
   * Allowed languages to preload and lookup (InitOptions['supportedLngs']).
   * Must include `defaultLanguage`.
   * @default ['en','sk','cs']
   */
  supportedLanguages?: Exclude<InitOptions['supportedLngs'], false>;

  /**
   * Languages to try if a translation key is missing in the requested language (InitOptions['fallbackLng']).
   * Can be a single code or an array of codes, in lookup order.
   * @default same as `defaultLanguage`
   */
  fallbackLanguages?: InitOptions['fallbackLng'];

  /**
   * Automatically match base language codes (e.g. match 'en' to 'en-US' bundles).
   * @default true
   */
  nonExplicitSupportedLngs?: InitOptions['nonExplicitSupportedLngs'];

  /**
   * Language code lookup strategy (InitOptions['load']).
   * - 'all'          → ['en-US','en','dev']
   * - 'currentOnly'  → ['en-US']
   * - 'languageOnly' → ['en']
   * @default 'languageOnly'
   */
  load?: InitOptions['load'];

  /**
   * Languages to preload on startup (InitOptions['preload']).
   * Preloads ensure keys are available before requests are handled.
   * @default false
   */
  preload?: InitOptions['preload'];

  /**
   * If true, lowercases full locale codes (InitOptions['lowerCaseLng']).
   * @default false
   */
  lowerCaseLng?: InitOptions['lowerCaseLng'];

  /**
   * If true, only lowercases the language part of the code (InitOptions['cleanCode']).
   * @default false
   */
  cleanCode?: InitOptions['cleanCode'];

  /**
   * Registered namespaces (InitOptions['ns']).
   * Allows grouping translations by file/module.
   * @default ['translation']
   */
  namespaces?: InitOptions['ns'];

  /**
   * Default namespace for translation calls.
   * Must be a single (string) namespace—not an array.
   * @default 'translation'
   */
  defaultNamespace?: string;

  /**
   * Key separator for nested JSON keys (InitOptions['keySeparator']).
   * @default '.'
   */
  keySeparator?: InitOptions['keySeparator'];

  /**
   * Namespace separator (InitOptions['nsSeparator']).
   * @default ':'
   */
  nsSeparator?: InitOptions['nsSeparator'];

  /**
   * Plural separator for keys (InitOptions['pluralSeparator']).
   * @default '_'
   */
  pluralSeparator?: InitOptions['pluralSeparator'];

  /**
   * Context separator for keys (InitOptions['contextSeparator']).
   * @default '_'
   */
  contextSeparator?: InitOptions['contextSeparator'];

  /**
   * Enable debug logging in i18next initialization and translation (InitOptions['debug']).
   * @default false
   */
  debug?: InitOptions['debug'];
}
