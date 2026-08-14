import { type I18nOptions, I18nProvider } from './i18n-provider';

/**
 * @description Options used when resolving localized text.
 */
export interface I18nFactoryOptions {
  /**
   * @description Explicit message override returned instead of resolving the L10n key.
   * @default null
   */
  overrideMessage?: string | null;

  /**
   * @description i18next options passed to the active i18n provider.
   * @default undefined
   */
  i18n?: I18nOptions;
}

/**
 * @description Resolves L10n keys into localized text.
 *
 * @example
 * ```ts
 * const message = I18nFactory.make('messages.account.email_code_sent');
 * ```
 *
 * @example
 * ```ts
 * const message = I18nFactory.make(L10n.Errors.Common.NotFound, {
 *   i18n: { resource: 'account' },
 * });
 * ```
 */
export class I18nFactory {
  /**
   * @description Resolves an L10n key into localized text.
   *
   * @param key L10n key, for example `errors.common.not_found`.
   * @param options Optional override or i18next options.
   * @returns Localized text from the active i18n provider.
   */
  public static make(key: string, options: I18nFactoryOptions = {}): string {
    return this.translateKey(key, options);
  }

  /**
   * @description Resolves an L10n key into localized text.
   *
   * @param key L10n key, for example `errors.common.not_found`.
   * @param options Optional override or i18next options.
   * @returns Localized text from the active i18n provider.
   */
  public static translateKey(key: string, options: I18nFactoryOptions = {}): string {
    const { overrideMessage, i18n } = options;

    return overrideMessage ?? I18nProvider.t(key, i18n);
  }
}
