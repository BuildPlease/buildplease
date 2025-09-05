import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-09-01',

  modules: ['@nidavellirx/meowv-nuxt-zod-i18n', '@nuxtjs/i18n', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],

  alias: {
    '@schema': r('./schema'),
  },

  ui: {
    // @ts-expect-error see https://ui.nuxt.com/components/icon#dynamic
    icons: {
      dynamic: true,
    },
  },

  meowvZodi18n: {
    localeCodesMapping: {
      'sk-SK': 'sk',
    },
  },

  i18n: {
    types: 'composition',
    strategy: 'prefix_except_default',
    defaultDirection: 'ltr',
    defaultLocale: 'en-GB',
    langDir: 'i18n',
    restructureDir: './app',
    vueI18n: 'i18n.config.ts',
    locales: [
      {
        code: 'en-GB',
        dir: 'ltr',
        file: 'en-GB.json',
        isCatchallLocale: true,
        language: 'en-GB',
        name: 'English',
      },
      {
        code: 'fr-FR',
        dir: 'ltr',
        file: 'fr-FR.json',
        language: 'fr-FR',
        name: 'French',
      },
      {
        code: 'sk',
        dir: 'ltr',
        file: 'sk.json',
        language: 'sk-SK',
        name: 'Slovenčina',
      },
    ],
  },
});
