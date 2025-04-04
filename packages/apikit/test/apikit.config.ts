import { defineApikitConfig } from '../src/core/modules/configuration/apikit-config';

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
          level: 'info',
          target: 'pino-pretty',
          timestamp: true,
          pretty: {
            colorize: true,
            translateTime: 'SYS:standard',
            levelFirst: true,
            ignore: 'pid,hostname',
          },
        },
      ],
    },
    production: {
      transports: [
        {
          type: 'console',
          level: 'warn',
          target: 'console',
          timestamp: true,
          pretty: {
            colorize: true,
            translateTime: 'SYS:standard',
            levelFirst: true,
            ignore: 'pid,hostname',
          },
        },
        {
          type: 'file',
          level: 'debug',
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
});
