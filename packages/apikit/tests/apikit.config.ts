import { defineApikitConfig } from '@nidavellirx/meowv-apikit';

export default defineApikitConfig({
  outDir: 'apikit-runtime',
  environments: [
    {
      debug: true,
      name: 'development',
      file: '.env.development',
    },
    {
      debug: false,
      name: 'production',
      file: '.env.production',
    },
  ],
  server: {
    development: {
      identifier: 'server-development',
    },
    production: {
      identifier: 'server-production',
    },
  },
  logger: {
    development: {
      transports: [
        {
          type: 'console',
          target: 'pino-pretty',
          level: 'debug',
          pretty: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      ],
    },
    production: {
      transports: [
        {
          type: 'file',
          path: './logs/production.log',
        },
      ],
    },
  },
  email: {
    enabled: true,
    templatesPath: './test/templates',
  },
  i18n: {
    directories: [{ path: './src/locales' }],
    files: [
      { locale: 'sk', path: './src/locales/sk-custom.json' },
      { locale: 'en', path: './overrides/en.json' },
    ],
    defaultLanguage: 'sk',
    supportedLanguages: ['sk', 'en'],
  },
});
