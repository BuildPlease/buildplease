import type { NuxtKitOptions } from './types';

export const DEFAULT_OPTIONS = {
  debug: false,
  zodI18n: {
    keyPrefix: 'nuxtkit.zod',
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
    genericErrorKey: 'nuxtkit.error.generic',
    genericMessageFallback: 'Something went wrong',
  },
} as const satisfies NuxtKitOptions;
