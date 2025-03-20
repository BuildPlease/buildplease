import { resolve } from 'path';
import { existsSync } from 'fs';

import { defineCommand } from 'citty';
import { createJiti } from 'jiti';

import { build } from '@/core/builder';
import { ApiKitConfig } from '@/core/defineConfig';

const log = {
  success: (message: string) => console.log('\x1b[32m ' + message + '\x1b[0m'),
  error: (message: string) =>
    console.error('\x1b[31m❌ ' + message + '\x1b[0m'),
  info: (message: string) => console.log('\x1b[34m ' + message + '\x1b[0m'),
};

export const buildCommand = defineCommand({
  meta: {
    name: 'build',
    description: 'Build API application',
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
      description: [
        'The configuration file to use relative to the current working directory.',
        'By default, apikit tries to read `apikit.config` from the build `DIR` by default.',
        '',
      ].join('\n'),
    },
  },
  run: async ({ args }) => {
    const rootDir = resolve(process.cwd(), args.dir || '.');
    const configFile = args.config
      ? resolve(process.cwd(), args.config)
      : resolve(rootDir, 'apikit.config');

    if (!existsSync(rootDir)) {
      log.error(`Directory ${rootDir} does not exist.`);
      process.exit(1);
    }

    log.info(`🚀 Building..`);

    try {
      const jiti = createJiti(rootDir, { interopDefault: true });
      const config: ApiKitConfig = await jiti.import(configFile, {
        try: !args.config,
        default: true,
      });

      if (!config) throw new Error('Invalid or missing configuration.');

      await build(config);

      log.success('✅ Build complete!');
    } catch (error) {
      log.error(`Error loading config: ${(error as Error).message}`);
      process.exit(1);
    }
  },
});
