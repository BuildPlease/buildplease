import { defineCommand } from 'citty';

import { loadConfig, log } from './utils';

import { generate } from '@/generator';

export const buildCommand = defineCommand({
  meta: {
    name: 'build',
    description: 'Build application',
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

      const config = await loadConfig(args.dir, args.config);

      await generate(config);

      log.success('🎉 Build complete!');
    } catch (error) {
      log.error((error as Error).message);
      process.exit(1);
    }
  },
});
