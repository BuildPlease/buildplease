import {
  type InferConfiguration,
  defineApikit,
  defineConfiguration,
  defineEnvironments,
  defineSource,
  field,
} from '@meawkit/apikit';

// MARK: - Environments

const environments = defineEnvironments({
  development: {
    file: '.env.development',
  },

  test: {
    file: '.env.test',
  },

  production: {
    file: '.env.production',
  },
});

const from = defineSource(environments);

// MARK: - Custom Configurations

export const EdgeConfiguration = defineConfiguration('app.edge', {
  api: {
    origin: field.string(),
  },

  web: {
    origin: field.string(),
  },

  documentation: {
    title: field.string(),
    routePrefix: field.string(),
  },
});

export type EdgeConfiguration = InferConfiguration<typeof EdgeConfiguration>;

// MARK: - Config

export default defineApikit(environments, {
  build: {
    outDir: '.apikit',

    debug: from.byEnvironment({
      development: true,
      test: false,
      production: false,
    }),
  },

  server: {
    identifier: from.byEnvironment({
      development: 'development:server',
      test: 'test:server',
      production: 'production:server',
    }),

    host: from.env('SERVER_HOST'),
    port: from.env('SERVER_PORT'),

    trustProxy: from.byEnvironment({
      development: '::1',
      test: from.env('SERVER_TRUST_PROXY'),
      production: from.env('SERVER_TRUST_PROXY'),
    }),
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
            levelFirst: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        },
      ],
    },

    test: {
      enabled: true,
      transports: [
        {
          type: 'console',
          target: 'pino-pretty',
          level: 'debug',
          pretty: {
            colorize: true,
            levelFirst: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        },
        {
          type: 'file',
          level: 'info',
          path: from.env('LOGGER_PATH'),
        },
      ],
    },

    production: {
      enabled: true,
      transports: [
        {
          type: 'file',
          level: 'info',
          path: from.env('LOGGER_PATH'),
        },
      ],
    },
  }),

  metrics: {
    enabled: true,
    endpoint: '/metrics',
  },

  cors: {
    enabled: true,

    allowAllOrigins: from.byEnvironment({
      development: true,
      test: false,
      production: false,
    }),

    includeWwwSubdomain: true,

    options: {
      origin: from.byEnvironment({
        development: undefined,
        test: from.env('APP_EDGE_WEB_ORIGIN'),
        production: from.env('APP_EDGE_WEB_ORIGIN'),
      }),

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
    username: from.env('BASIC_AUTH_USERNAME'),
    password: from.env('BASIC_AUTH_PASSWORD'),

    authenticate: from.byEnvironment({
      development: false,
      test: {
        realm: 'Test API Documentation',
      },
      production: {
        realm: 'Production API Documentation',
      },
    }),
  },

  email: {
    enabled: true,
    templatesPath: './src/library/email/templates',

    globals: {
      organizationName: 'Peyvee',
      supportEmail: 'support@peyvee.com',
      copyright: `Peyvee © ${new Date().getFullYear()}`,
      logoUrl: 'https://www.peyvee.com/wp-content/uploads/2024/07/peyvee-logo-site.png',
    },

    smtp: {
      host: from.env('SMTP_HOST'),
      port: from.env('SMTP_PORT'),
      secure: from.env('SMTP_SECURE'),
      user: from.env('SMTP_USER'),
      password: from.env('SMTP_PASSWORD'),
    },
  },

  i18n: {
    directories: [
      {
        path: './src/library/i18n/locales',
      },
    ],
  },

  staticFiles: {
    enabled: true,
    routePrefix: '/',
    publicDirectory: './public',
  },

  configurations: [
    EdgeConfiguration({
      api: {
        origin: from.env('APP_EDGE_API_ORIGIN'),
      },

      web: {
        origin: from.env('APP_EDGE_WEB_ORIGIN'),
      },

      documentation: {
        title: from.env('APP_EDGE_DOCUMENTATION_TITLE'),
        routePrefix: 'swagger',
      },
    }),
  ],
});
