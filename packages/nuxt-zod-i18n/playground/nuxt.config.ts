export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/i18n', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  ui: {
    // @ts-expect-error see https://ui.nuxt.com/components/icon#dynamic
    icons: {
      dynamic: true,
    },
  },

  compatibilityDate: '2024-09-16',

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
    restructureDir: false,
    vueI18n: 'i18n.config.ts',
    lazy: true,
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
