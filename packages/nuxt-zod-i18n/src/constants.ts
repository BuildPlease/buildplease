export const NUXT_MODULE_ID = '@meowv/nuxt-zod-i18n';

export const DEFAULT_OPTIONS = {
  useModuleLocale: true,
  useModulePluralization: true,
  dateFormat: {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  } as Intl.DateTimeFormatOptions,
} as const;
