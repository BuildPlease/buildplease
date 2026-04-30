import type { Level } from 'pino';

import type {
  EmailConfig,
  LoggerConfig,
  MetricsConfig,
  ServerConfig,
  StaticFilesConfig,
} from '@/configuration';

interface ApiKitConfigDefaults {
  outDir: string;

  environment: {
    debug: boolean;
    fileDir: string;
  };

  server: {
    config: Pick<ServerConfig, 'trustProxy'>;
  };

  logger: {
    defaultLevel: Level;
    config: LoggerConfig;
  };

  metrics: {
    config: MetricsConfig;
  };

  email: {
    config: Pick<EmailConfig, 'templatesPath' | 'globals'>;
  };

  staticFiles: {
    config: Omit<StaticFilesConfig, 'rootPath'>;
  };
}

export const ApiKitConfigDefaults: ApiKitConfigDefaults = {
  outDir: 'apikit-runtime',

  environment: {
    debug: false,
    fileDir: process.cwd(),
  },

  server: {
    config: {
      trustProxy: false,
    },
  },

  logger: {
    defaultLevel: 'info',
    config: {
      disabled: false,
      transports: [],
    },
  },

  metrics: {
    config: {
      enabled: false,
      endpoint: '/metrics',
    },
  },

  email: {
    config: {
      templatesPath: './src/templates',
      globals: {},
    },
  },

  staticFiles: {
    config: {
      enabled: true,
      routePrefix: '/',
      maxAge: 3600,
      dotfiles: 'ignore',
      etag: true,
      immutable: true,
      decorateReply: true,
      preCompressed: false,
    },
  },
};
