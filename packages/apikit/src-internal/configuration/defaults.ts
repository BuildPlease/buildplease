import type { Level } from 'pino';

import type { LoggerConfig } from '@/configuration';

interface ApiKitConfigDefaults {
  outDir: string;
  environment: {
    debug: boolean;
  };
  logger: {
    defaultLevel: Level;
    config: LoggerConfig;
  };
}

export const ApiKitConfigDefaults: ApiKitConfigDefaults = {
  outDir: 'apikit-runtime',
  environment: {
    debug: false,
  },
  logger: {
    defaultLevel: 'info',
    config: {
      disabled: false,
      transports: [],
    },
  },
};
