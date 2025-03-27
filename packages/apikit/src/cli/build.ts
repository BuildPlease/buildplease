import { defineCommand } from 'citty';

import { loadConfig, log } from './utils';

import { generate } from '@/generator';

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
      '  apikit build -c custom.config -d ./configs',
    ].join('\n'),
  },
  args: {
    dir: {
      type: 'string',
      description: 'The directory to build',
      name: 'dir',
      required: false,
    },
    config: {
      type: 'string',
      name: 'config',
      description: [
        'The configuration file to use relative to the current working directory.',
        'By default, apikit tries to read `apikit.config` from the build `DIR` by default.',
        '',
      ].join('\n'),
      required: false,
    },
  },
  run: async ({ args }) => {
    try {
      log.info('🚀 Building...');

      const { dir: argDirPath, config: argConfigName } = args;
      const apikitConfig = await loadConfig(argDirPath, argConfigName);

      await generate(apikitConfig);

      log.success('🎉 Build complete!');
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  },
});
