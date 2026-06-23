import { Consola } from '@internal/consola';
import { defineCommand } from 'citty';

import { ApiKitPipeline, environmentStep, generateStep, loadConfigStep } from './pipeline';

type BuildCommandArgs = {
  readonly dir?: string;
  readonly config?: string;
};

export const buildCommand = defineCommand({
  meta: {
    name: 'build',
    description: [
      'Build application',
      '',
      'Usage:',
      '  apikit build [--dir <directory>] [--config <config-name>]',
      '',
      'Examples:',
      '  apikit build',
      '  apikit build --dir ./src',
      '  apikit build -d ./configs -c custom.config',
    ].join('\n'),
  },
  args: {
    dir: {
      type: 'string',
      description: 'Directory to look for apikit.config',
      name: 'dir',
      alias: 'd',
      required: false,
    },
    config: {
      type: 'string',
      name: 'config',
      alias: 'c',
      description: [
        'The configuration file to use relative to the current working directory.',
        'By default, apikit tries to read `apikit.config`',
        '',
      ].join('\n'),
      required: false,
    },
  },
  run: async ({ args }) => {
    const { dir, config } = args as BuildCommandArgs;

    try {
      await ApiKitPipeline.build('build').use(loadConfigStep()).use(environmentStep()).use(generateStep()).run({
        dir: dir,
        config: config,
      });
    } catch (error) {
      Consola.error('ApiKit build failed');
      Consola.error(error instanceof Error ? error.message : String(error));

      process.exit(1);
    }
  },
});
