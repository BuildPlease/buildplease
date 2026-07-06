import { type I18nOptions, I18nProvider } from './i18n-provider';

/**
 * @description Options used when resolving localized text.
 */
export interface I18nFactoryOptions {
  /**
   * @description Explicit message override returned instead of resolving the i18n key.
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
 * @description Resolves generated i18n keys into localized text.
 *
 * @example
 * ```ts
 * const message = I18nFactory.make(I18n.Messages.Account.EmailCodeSent);
 * ```
 *
 * @example
 * ```ts
 * const message = I18nFactory.make(I18n.Errors.Common.NotFound, {
 *   i18n: { resource: 'account' },
 * });
 * ```
 */
export class I18nFactory {
  /**
   * @description Resolves a generated i18n key into localized text.
   *
   * @param key Generated i18n key, usually from `.apikit/i18n.ts`.
   * @param options Optional override or i18next options.
   * @returns Localized text from the active i18n provider.
   *
   * @example
   * ```ts
   * I18nFactory.make(I18n.Messages.Account.EmailCodeSent);
   * ```
   */
  public static make(key: string, options: I18nFactoryOptions = {}): string {
    return this.translateKey(key, options);
  }

  /**
   * @description Resolves a raw i18n key into localized text.
   *
   * @param key Raw i18n key, for example `errors.common.not_found`.
   * @param options Optional override or i18next options.
   * @returns Localized text from the active i18n provider.
   *
   * @example
   * ```ts
   * I18nFactory.translateKey('errors.common.not_found');
   * ```
   */
  public static translateKey(key: string, options: I18nFactoryOptions = {}): string {
    const { overrideMessage, i18n } = options;

    return overrideMessage ?? I18nProvider.t(key, i18n);
  }
}
