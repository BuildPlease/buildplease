import type { NuxtZodi18nOptions } from './types';

export const NUXT_MODULE_ID = '@meowv/nuxt-zod-i18n';
export const NUXT_CONFIG_KEY = 'meowvZodi18n';

export const DEFAULT_OPTIONS = {
  useModuleLocale: true,
  dateFormat: { day: '2-digit', month: 'long', year: 'numeric' },
  localeCodesMapping: null,
} as const satisfies NuxtZodi18nOptions;
