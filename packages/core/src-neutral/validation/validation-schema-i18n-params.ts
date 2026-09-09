/**
 * Localization metadata attached to a custom validation issue.
 *
 * @remarks
 * ApiKit and NuxtKit read this shape from Zod custom issue `params` to resolve
 * a localized validation message without coupling validation schemas to a
 * specific I18n runtime.
 */
export type ValidationSchemaI18nParams = {
  i18n: {
    key: string;
    values?: Record<string, unknown>;
  };
};
