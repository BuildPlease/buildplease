import type { FastifyBasicAuthOptions } from '@fastify/basic-auth';
import type { FastifyCorsOptions } from '@fastify/cors';
import type {
  FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartBaseOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart';
import type { FastifyStaticOptions } from '@fastify/static';
import type { RouteOptions } from 'fastify';
import type { InitOptions } from 'i18next';
import type { Level } from 'pino';

type BasicAuthOptions = Omit<FastifyBasicAuthOptions, 'validate' | 'authenticate'>;
type CorsOptions = Omit<FastifyCorsOptions, 'origin'>;

type MultipartOptions =
  | FastifyMultipartBaseOptions
  | FastifyMultipartOptions
  | FastifyMultipartAttachFieldsToBodyOptions;

type StaticFilesDotfilesMode = NonNullable<FastifyStaticOptions['dotfiles']>;

interface MetricsDefaultConfig {
  enabled: boolean;
}

interface MetricsRouteConfig {
  enabled?:
    | boolean
    | {
        histogram?: boolean;
        summary?: boolean;
      };

  registeredRoutesOnly?: boolean;
  groupStatusCodes?: boolean;
  routeBlacklist?: (string | RegExp)[];
  methodBlacklist?: string[];
  invalidRouteGroup?: string;
}

type I18nFallbackLanguages = Extract<
  NonNullable<InitOptions<object>['fallbackLng']>,
  string | readonly string[]
>;

type I18nLoadMode = NonNullable<InitOptions<object>['load']>;
type I18nPreload = NonNullable<InitOptions<object>['preload']>;

interface ApiKitDefaultsSchema {
  runtime: {
    debug: boolean;
    outDir: string;
    environmentFileDir: string;
  };

  logger: {
    enabled: false;
    defaultLevel: Level;
  };

  server: {
    trustProxy: false;
  };

  metrics: {
    enabled: false;
    endpoint: '/metrics';
    name: 'metrics';
    defaultMetrics: {
      enabled: true;
    };
    routeMetrics: {
      enabled: true;
    };
    clearRegisterOnInit: false;
  };

  email: {
    enabled: boolean;
    templatesPath: string;
    globals: Record<string, unknown>;
  };

  i18n: {
    directories: [];
    files: [];

    defaultLanguage: string;
    fallbackLanguages: I18nFallbackLanguages;
    supportedLanguages: string[];

    load: I18nLoadMode;
    preload: I18nPreload;
    nonExplicitSupportedLngs: boolean;
    lowerCaseLng: boolean;
    cleanCode: boolean;

    defaultNamespace: string;

    keySeparator: string;
    nsSeparator: string;
    pluralSeparator: string;
    contextSeparator: string;
  };

  staticFiles: {
    enabled: boolean;
    routePrefix: string;
    maxAge: number;
    dotfiles: StaticFilesDotfilesMode;
    etag: boolean;
    immutable: boolean;
    decorateReply: boolean;
    preCompressed: boolean;
  };

  basicAuth: {
    enabled: boolean;
    authenticate: boolean;
    realm: string;
    options: BasicAuthOptions;
  };

  cors: {
    enabled: boolean;
    isDevelopment: boolean;
    allowedOrigins: string[];
    options: CorsOptions;
  };

  multipart: {
    enabled: boolean;
    options: MultipartOptions;
  };
}

export const ApiKitDefaults: ApiKitDefaultsSchema = {
  runtime: {
    debug: false,
    outDir: 'apikit-runtime',
    environmentFileDir: process.cwd(),
  },

  logger: {
    enabled: false,
    defaultLevel: 'info',
  },

  server: {
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

  email: {
    enabled: false,
    templatesPath: './src/templates',
    globals: {},
  },

  i18n: {
    directories: [],
    files: [],

    defaultLanguage: 'en',
    fallbackLanguages: 'en',
    supportedLanguages: ['en', 'sk', 'cs'],

    load: 'languageOnly',
    preload: ['en', 'sk', 'cs'],
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
    dotfiles: 'ignore',
    etag: true,
    immutable: true,
    decorateReply: true,
    preCompressed: false,
  },

  basicAuth: {
    enabled: false,
    authenticate: false,
    realm: 'Access to the site',
    options: {},
  },

  cors: {
    enabled: false,
    isDevelopment: false,
    allowedOrigins: [],
    options: {
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
      optionsSuccessStatus: 200,
    },
  },

  multipart: {
    enabled: false,
    options: {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    },
  },
};
