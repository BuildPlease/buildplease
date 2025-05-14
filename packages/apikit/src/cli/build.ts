import { defineCommand } from 'citty';

import { generate } from '@/generator';
import { loadConfig, log } from '@/utils';

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
    try {
      log.info('🚀 Building Apikit');

      const { dir: argDirPath, config: argConfigName } = args;
      const apikitConfig = await loadConfig(argDirPath, argConfigName);

      await generate(apikitConfig);

      log.success('🎉 Build Complete!');
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  },
});
