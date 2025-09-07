import type { NuxtKitOptions } from './types';

export const NUXT_MODULE_ID = '@meowv/nuxtkit';
export const NUXT_CONFIG_KEY = 'meowvNuxtKit';

export const DEFAULT_OPTIONS = {
  debug: false,
  unauthorizedStatusCodes: [401],
  errors: {
    genericErrorKey: 'errors.generic',
    genericMessageFallback: 'Something went wrong',
    unauthorizedKey: 'errors.unauthorized',
    unauthorizedMessageFallback: 'Unauthorized',
  },
  zodI18n: {
    fallback: 'en',
    languageAlias: {},
    customLocales: {},
  },
} as const satisfies NuxtKitOptions;
