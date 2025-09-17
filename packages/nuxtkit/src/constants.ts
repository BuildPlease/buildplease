import type { NuxtKitOptions } from './types';

export const NUXT_MODULE_ID = '@meowv/nuxtkit';
export const NUXT_CONFIG_KEY = 'meowvNuxtKit';

export const DEFAULT_OPTIONS = {
  debug: false,
  components: {
    prefix: '',
  },
  unauthorizedStatusCodes: [401],
  errors: {
    genericErrorKey: 'error.generic',
    genericMessageFallback: 'Something went wrong',
    unauthorizedKey: 'error.unauthorized',
    unauthorizedMessageFallback: 'Unauthorized',
  },
  zodI18n: {
    useModuleLocale: true,
    keyPrefix: 'zod',
    languageAlias: {
      en: ['en-GB', 'en-US'],
      sk: ['sk-SK'],
      cs: ['cs-CZ'],
    },
    dateFormat: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  },
} as const satisfies NuxtKitOptions;
