import { DEFAULT_LOCALE_CODE, LOCALES } from './app/i18n';

export default defineNuxtConfig({
  ssr: false,

  devServer: {
    port: 3333,
    host: 'localhost',
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-09-01',
  modules: ['@buildplease/nuxtkit'],
  css: ['~/assets/styles/main.css'],

  icon: {
    clientBundle: {
      scan: true,
    },
  },

  buildpleaseNuxtKit: {
    debug: true,
    components: {
      prefix: 'NuxtKit',
    },
  },

  i18n: {
    restructureDir: 'app',
    types: 'composition',
    defaultLocale: DEFAULT_LOCALE_CODE,
    defaultDirection: 'ltr',
    strategy: 'prefix_except_default',
    langDir: 'l10n',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'nuxtkit_playground_i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: DEFAULT_LOCALE_CODE,
    },
    locales: LOCALES,
  },
});
