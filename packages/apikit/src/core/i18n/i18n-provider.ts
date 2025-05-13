import i18next, { type TOptions } from 'i18next';

import { RequestScope } from '#/request';

export interface I18nOptions extends TOptions {
  /**
   * If true (default), will use the locale from RequestScope if available.
   * This can be overridden by specifying `lng` explicitly.
   *
   * @default true
   */
  scoped?: boolean;
}

export class I18nProvider {
  /**
   * Translates a key using i18next.
   *
   * @param key - Translation key (e.g., 'errors.INVALID_EMAIL')
   * @param options - Optional interpolation and config
   */
  public static t(key: string, options: I18nOptions = {}): string {
    const { scoped = true, lng, ...i18nOptions } = options;

    const locale = lng ?? (scoped ? RequestScope.locale : undefined) ?? i18next.language;

    return i18next.t(key, { lng: locale, ...i18nOptions });
  }
}
