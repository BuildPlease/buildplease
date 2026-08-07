import { fileURLToPath } from 'node:url';

import { DEFAULT_LOCALE_CODE, LOCALES } from './i18n/index';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineNuxtConfig({
  devServer: {
    port: 5000,
    host: 'localhost',
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-09-01',
  modules: ['@meawkit/nuxtkit'],
  css: ['~/assets/styles/main.css'],

  icon: {
    clientBundle: {
      scan: true,
    },
    serverBundle: {
      collections: ['lucide'],
    },
  },

  alias: {
    '@di': r('./di'),
    '@schema': r('./schema'),
    '@feature': r('./feature'),
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },

  meawkitNuxtKit: {
    debug: true,
    components: {
      prefix: 'NuxtKit',
    },
    unauthorizedStatusCodes: [401],
  },

  i18n: {
    vueI18n: r('./i18n.config.ts'),
    types: 'composition',
    defaultLocale: DEFAULT_LOCALE_CODE,
    defaultDirection: 'ltr',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'nuxtkit_playground_i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: DEFAULT_LOCALE_CODE,
    },
    locales: LOCALES,
  },
});
