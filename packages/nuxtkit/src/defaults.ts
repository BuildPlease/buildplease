import type { NuxtKitOptions } from './types';

export const DEFAULT_OPTIONS = {
  debug: false,
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
  components: {
    prefix: '',
  },
  errors: {
    genericErrorKey: 'errors.generic',
    genericMessageFallback: 'Something went wrong',
    unauthorizedKey: 'errors.unauthorized',
    unauthorizedMessageFallback: 'Access denied',
  },
  unauthorizedStatusCodes: [401],
} as const satisfies NuxtKitOptions;
