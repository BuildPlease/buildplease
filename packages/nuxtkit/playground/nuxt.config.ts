import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineNuxtConfig({
  devServer: {
    port: 5000,
    host: 'localhost',
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-09-01',
  modules: ['@meawkit/nuxtkit', '@nuxtjs/i18n', '@nuxt/ui'],
  css: ['~/assets/styles/main.css'],

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

  meowvNuxtKit: {
    debug: true,
    components: {
      prefix: 'NuxtKit',
    },
    unauthorizedStatusCodes: [401],
    errors: {
      genericErrorKey: 'error.generic',
      genericMessageFallback: 'Error',
      unauthorizedKey: 'error.unauthorized',
      unauthorizedMessageFallback: 'Unauthorized',
    },
    zodI18n: {
      useModuleLocale: true,
    },
  },

  i18n: {
    vueI18n: r('./i18n.config.ts'),
    types: 'composition',
    defaultLocale: 'en-GB',
    defaultDirection: 'ltr',
    strategy: 'prefix_except_default',
    langDir: 'i18n',
    restructureDir: './app',
    locales: [
      {
        code: 'en-GB',
        dir: 'ltr',
        file: 'en-GB.json',
        isCatchallLocale: true,
        language: 'en-GB',
        name: 'English',
        flag: 'gb',
      },
      {
        code: 'sk',
        dir: 'ltr',
        file: 'sk.json',
        language: 'sk-SK',
        name: 'Slovenčina',
        flag: 'sk',
      },
      {
        code: 'cs',
        dir: 'ltr',
        file: 'cs.json',
        language: 'cs-CZ',
        name: 'Čeština',
        flag: 'cz',
      },
      {
        code: 'fr-FR',
        dir: 'ltr',
        file: 'fr-FR.json',
        language: 'fr-FR',
        name: 'French',
        flag: 'fr',
      },
    ],
  },
});
