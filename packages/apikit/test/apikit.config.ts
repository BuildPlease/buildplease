import { defineApikitConfig } from '../src/core/configuration/apikit-define';

export default defineApikitConfig({
  environments: [
    {
      name: 'development',
      file: '.env.development',
    },
    {
      name: 'production',
      file: '.env.production',
    },
  ],
  server: {
    development: {
      identifier: 'server-development',
      host: 'localhost',
      port: 3000,
    },
    production: {
      identifier: 'server-production',
      host: 'localhost',
      port: 3001,
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
        {
          type: 'console',
          target: 'console',
          timestamp: false,
        },
      ],
    },
    production: {
      transports: [
        {
          type: 'file',
          logFilePath: './logs/production.log',
          timestamp: true,
          options: {
            sync: false,
            mode: 0o666,
            mkdir: true,
          },
        },
      ],
    },
  },
  email: {
    enabled: true,
    templatesBasePath: './test/templates',
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
