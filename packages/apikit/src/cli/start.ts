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
        const message = `Inevalid environment: "${environmentFilePath}", does not exist in configuration.`;
        throw new Error(message);
      }

      process.env.NODE_ENV = environment.name;
      dotenvx.config({ path: environmentFilePath });

      // MARK: - Check if NODE_ENV matches environment.name after loading, prevent overloading from .env file
      if (process.env.NODE_ENV !== environment.name) {
        const errorMessage = `NODE_ENV was set to "${process.env.NODE_ENV}", but the environment is "${environment.name}"`;
        throw new Error(errorMessage);
      }

      global.apikit.config = config;
      global.apikit.currentEnvironment = environment;

      log.success(
        `\n🚀 ApiKit successfully started in '${process.env.NODE_ENV.toUpperCase()}' environment`,
      );
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  },
});
