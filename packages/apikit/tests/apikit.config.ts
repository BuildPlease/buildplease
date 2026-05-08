import {
  type InferConfiguration,
  defineApikit,
  defineConfiguration,
  defineEnvironments,
  defineSource,
  field,
} from '@meawkit/apikit';

const environments = defineEnvironments({
  development: {
    file: '.env.development',
  },

  production: {
    file: '.env.production',
  },
});

const from = defineSource(environments);

export const EdgeConfiguration = defineConfiguration({
  apiDomain: field.string(),
});

export type EdgeConfiguration = InferConfiguration<typeof EdgeConfiguration>;

export default defineApikit(environments, {
  runtime: {
    outDir: 'apikit-runtime',

    debug: from.byEnvironment({
      development: true,
      production: false,
    }),
  },

  server: {
    identifier: from.byEnvironment({
      development: 'server-development',
      production: 'server-production',
    }),

    host: from.env('SERVER_HOST'),
    port: from.env('SERVER_PORT'),
  },

  logger: from.byEnvironment({
    development: {
      enabled: true,
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
      enabled: false,
    },
  }),

  email: {
    enabled: true,
    templatesPath: './src/library/email/templates',

    smtp: {
      host: from.env('SMTP_HOST'),
      port: from.env('SMTP_PORT'),
      user: from.env('SMTP_USER'),
      password: from.env('SMTP_PASSWORD'),
      sender: from.env('SMTP_SENDER'),
    },
  },

  metrics: {
    enabled: true,
    endpoint: '/metrics',
  },

  staticFiles: {
    enabled: true,
    publicDirectory: './public',
  },

  cors: {
    enabled: true,

    isDevelopment: from.byEnvironment({
      development: true,
      production: false,
    }),

    allowedOrigins: from.env('EDGE_WEB_DOMAIN'),

    options: {
      exposedHeaders: ['x-session-token'],
    },
  },

  multipart: {
    enabled: true,

    options: {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    },
  },

  basicAuth: {
    enabled: true,
    username: from.env('EDGE_AUTH_USERNAME'),
    password: from.env('EDGE_AUTH_PASSWORD'),
    authenticate: false,
  },

  configurations: [
    EdgeConfiguration({
      apiDomain: from.env('EDGE_API_DOMAIN'),
    }),
  ],
});
