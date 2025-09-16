import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-09-01',
  modules: ['@nidavellirx/meowv-nuxtkit', '@nuxtjs/i18n', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],

  alias: {
    '@di': r('./di'),
    '@schema': r('./schema'),
    '@feature': r('./feature'),
    '@networking': r('./networking'),
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
