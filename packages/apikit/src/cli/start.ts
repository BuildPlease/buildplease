import fs from 'fs';
import path from 'path';

import dotenvx from '@dotenvx/dotenvx';
import { defineCommand } from 'citty';

import { loadConfig, log } from './utils';

export const startCommand = defineCommand({
  meta: {
    name: 'start',
    description: 'Start application in the specified environment',
  },
  args: {
    environment: {
      type: 'positional',
      description: 'The environment to start',
      required: true,
    },
    dir: {
      type: 'string',
      description: 'The directory to start the application from',
      required: false,
    },
    config: {
      type: 'string',
      name: 'config',
      description: [
        'The configuration file to use relative to the current working directory.',
        'By default, apikit tries to read `apikit.config` from the build `DIR` by default.',
      ].join('\n'),
      required: false,
    },
  },
  run: async ({ args }) => {
    try {
      log.info(`Starting application in ${args.environment} mode...`);
      const config = await loadConfig(args.dir, args.config);

      const environment = config.environments.find(
        (env) => env.name === args.environment,
      );

      if (!environment) {
        const message = `Environment "${args.environment}" is not defined in config.`;
        throw new Error(message);
      }

      const environmentFilePath = path.resolve(
        args.dir || process.cwd(),
        `.env.${environment.name}`,
      );

      if (!fs.existsSync(environmentFilePath)) {
        const message = `Environment file "${environmentFilePath}" does not exist.`;
        throw new Error(message);
      }

      dotenvx.config({ path: environmentFilePath });
      process.env.APP_ENV = environment.name;
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  },
});
