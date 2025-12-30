import i18next, { type TOptions } from 'i18next';

import { normalizeLocale, splitBaseRegion } from './utils';

import { RequestScope } from '@/request';

export interface I18nOptions extends TOptions {}

export class I18nProvider {
  /**
   * Translates a key using i18next.
   *
   * @param key - Translation key (e.g., 'errors.INVALID_EMAIL')
   * @param options - Optional interpolation and config
   */
  static t(key: string, options: TOptions = {}): string {
    const locale = RequestScope.locale;
    return i18next.t(key, { ...options, lng: locale });
  }

  /**
   * Returns the current effective locale.
   */
  public static get currentLocale(): string {
    return RequestScope.locale;
  }

  /**
   * Check if a locale is supported by the runtime i18n configuration.
   *
   * @param locale       Any locale tag (e.g., "en", "en-GB", "sk-SK").
   * @param options
   *   - ignoreRegion: if true (default), allow matching just the base language.
   *                   e.g., if "en" is supported, "en-GB" is considered supported.
   */
  public static isSupportedLanguage(
    locale?: string,
    options: { ignoreRegion?: boolean } = { ignoreRegion: true },
  ): boolean {
    const normalized = normalizeLocale(locale);
    if (!normalized) return false;

    const configured = i18next.options.supportedLngs;
    if (!configured) return false;

    const supported = new Set(configured.map(normalizeLocale));

    if (supported.has(normalized)) return true;

    if (options.ignoreRegion) {
      const { base } = splitBaseRegion(normalized);
      if (base && supported.has(base)) return true;
    }

    return false;
  }
}
