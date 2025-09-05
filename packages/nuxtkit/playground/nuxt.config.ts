import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-09-01',
  modules: ['@nidavellirx/meowv-nuxtkit', '@nuxtjs/i18n'],

  alias: {
    '@di': r('./di'),
    '@feature': r('./feature'),
    '@networking': r('./networking'),
  },

  i18n: {
    defaultLocale: 'en',
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },

  meowvNuxtKit: {
    unauthorizedStatusCodes: [401, 403],
    errors: {
      genericErrorKey: 'error.generic',
      genericMessageFallback: 'Error',
      unauthorizedKey: 'error.unauthorized',
      unauthorizedMessageFallback: 'Unauthorized',
    },
  },
});
