import type { FastifyBasicAuthOptions } from '@fastify/basic-auth';
import type { FastifyCorsOptions } from '@fastify/cors';
import type {
  FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartBaseOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart';
import type { FastifyStaticOptions } from '@fastify/static';
import type { InitOptions } from 'i18next';
import type { Level } from 'pino';

type CorsOptions = FastifyCorsOptions;

type MultipartOptions =
  | FastifyMultipartBaseOptions
  | FastifyMultipartOptions
  | FastifyMultipartAttachFieldsToBodyOptions;

type I18nFallbackLanguages = Extract<NonNullable<InitOptions<object>['fallbackLng']>, string | readonly string[]>;

interface ApiKitDefaultsSchema {
  build: {
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

  health: {
    enabled: true;
    url: '/alive';
    pressure: {
      maxEventLoopDelay: 0;
      maxHeapUsedBytes: 0;
      maxRssBytes: 0;
      maxEventLoopUtilization: 0;
    };
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

    load: NonNullable<InitOptions<object>['load']>;
    preload: NonNullable<InitOptions<object>['preload']>;
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
    dotfiles: NonNullable<FastifyStaticOptions['dotfiles']>;
    etag: boolean;
    immutable: boolean;
    decorateReply: boolean;
    preCompressed: boolean;
  };

  basicAuth: {
    enabled: boolean;
    authenticate: NonNullable<FastifyBasicAuthOptions['authenticate']>;
    proxyMode: boolean;
    header: string | undefined;
    strictCredentials: boolean | undefined;
  };

  cors: {
    enabled: boolean;
    allowAllOrigins: boolean;
    includeWwwSubdomain: boolean;
    options: CorsOptions;
  };

  multipart: {
    enabled: boolean;
    options: MultipartOptions;
  };
}

export const ApiKitDefaults: ApiKitDefaultsSchema = {
  build: {
    debug: false,
    outDir: '.apikit',
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

  health: {
    enabled: true,
    url: '/alive',
    pressure: {
      maxEventLoopDelay: 0,
      maxHeapUsedBytes: 0,
      maxRssBytes: 0,
      maxEventLoopUtilization: 0,
    },
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
    proxyMode: false,
    header: undefined,
    strictCredentials: undefined,
  },

  cors: {
    enabled: false,
    allowAllOrigins: false,
    includeWwwSubdomain: true,
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
