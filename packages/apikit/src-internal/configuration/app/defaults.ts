import type { FastifyBasicAuthOptions } from '@fastify/basic-auth';
import type { FastifyCorsOptions } from '@fastify/cors';
import type {
  FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartBaseOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart';
import type { FastifyStaticOptions } from '@fastify/static';
import type { InitOptions } from 'i18next';

type CorsOptions = FastifyCorsOptions;

type MultipartOptions =
  FastifyMultipartBaseOptions | FastifyMultipartOptions | FastifyMultipartAttachFieldsToBodyOptions;

type I18nFallbackLanguages = Extract<NonNullable<InitOptions<object>['fallbackLng']>, string | readonly string[]>;

type I18nLoadMode = NonNullable<InitOptions<object>['load']>;
type I18nPreload = NonNullable<InitOptions<object>['preload']>;

export const ApiKitAppDefaults = {
  build: {
    outDir: '.apikit-app',
  },

  logger: {
    enabled: false,
  },

  server: {
    debug: false,
    trustProxy: false,
  },

  metrics: {
    enabled: false,
    endpoint: '/metrics',
    name: 'metrics',
    defaultMetrics: {
      enabled: true,
    },
    routeMetrics: {
      enabled: true,
    },
    clearRegisterOnInit: false,
  },

  health: {
    enabled: true,
    url: '/health',
    pressure: {
      maxEventLoopDelay: 0,
      maxHeapUsedBytes: 0,
      maxRssBytes: 0,
      maxEventLoopUtilization: 0,
    },
  },

  notification: {
    enabled: false,
  },

  email: {
    enabled: false,
    templatesPath: './src/templates',
    globals: {} as Record<string, unknown>,
  },

  i18n: {
    directories: [],
    files: [],

    defaultLanguage: 'en',
    fallbackLanguages: 'en' as I18nFallbackLanguages,
    supportedLanguages: ['en', 'sk', 'cs'],

    load: 'languageOnly' as I18nLoadMode,
    preload: ['en', 'sk', 'cs'] as I18nPreload,
    nonExplicitSupportedLngs: true,
    lowerCaseLng: true,
    cleanCode: true,

    defaultNamespace: 'translation',

    keySeparator: '.',
    nsSeparator: ':',
    pluralSeparator: '_',
    contextSeparator: '_',
  },

  staticFiles: {
    enabled: false,
    routePrefix: '/',
    maxAge: 3600,
    dotfiles: 'ignore' as NonNullable<FastifyStaticOptions['dotfiles']>,
    etag: true,
    immutable: true,
    decorateReply: true,
    preCompressed: false,
  },

  basicAuth: {
    enabled: false,
    authenticate: false as NonNullable<FastifyBasicAuthOptions['authenticate']>,
    proxyMode: false,
    header: undefined as string | undefined,
    strictCredentials: undefined as boolean | undefined,
  },

  cors: {
    enabled: false,
    allowAllOrigins: false,
    includeWwwSubdomain: true,
    options: {
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
      optionsSuccessStatus: 200,
    } as CorsOptions,
  },

  multipart: {
    enabled: false,
    options: {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    } as MultipartOptions,
  },
} as const;
