import { defineCommand } from 'citty';

import { generate } from '@internal/generator';
import { Logger, loadConfig } from '@internal/utils';

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
      Logger.start('🚀 Building..');

      const { dir: argDirPath, config: argConfigName } = args;
      const apikitConfig = await loadConfig(argDirPath, argConfigName);

      await generate(apikitConfig);

      Logger.success('🎉 Build Complete!');
    } catch (error) {
      Logger.error(error);
      process.exit(1);
    }
  },
});
