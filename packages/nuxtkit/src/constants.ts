import type { NuxtKitOptions } from './types';

export const MODULE_NAME = '@meowv/nuxtkit';
export const CONFIG_KEY_NAME = 'meowvNuxtKit';

export const DEFAULT_OPTIONS = {
  debug: false,
  components: {
    prefix: '',
  },
  unauthorizedStatusCodes: [401],
  errors: {
    genericErrorKey: 'errors.generic',
    genericMessageFallback: 'Something went wrong',
    unauthorizedKey: 'errors.unauthorized',
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
