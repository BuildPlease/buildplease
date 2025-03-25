import { defineApikitConfig } from '../src/core/modules/configuration/defineConfig';

export default defineApikitConfig({
  outDir: './runtime',
  environments: [
    {
      name: 'development',
      file: '.env.development',
      logger: {
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
    },
    {
      name: 'production',
      file: '.env.production',
      logger: {
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
  ],
});
