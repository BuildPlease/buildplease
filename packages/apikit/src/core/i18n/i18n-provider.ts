import i18next, { type TOptions } from 'i18next';

import { RequestScope } from '#/request';

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
  public static currentLocale(): string {
    return RequestScope.locale;
  }
}
