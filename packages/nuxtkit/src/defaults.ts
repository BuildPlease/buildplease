import type { NuxtKitOptions } from './types';

export const DEFAULT_OPTIONS = {
  debug: false,
  zodI18n: {
    keyPrefix: 'meawkit.zod',
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
    genericErrorKey: 'meawkit.error.generic',
    genericMessageFallback: 'Something went wrong',
    unauthorizedKey: 'meawkit.error.unauthorized',
    unauthorizedMessageFallback: 'Access denied.',
  },
  unauthorizedStatusCodes: [401],
} as const satisfies NuxtKitOptions;
