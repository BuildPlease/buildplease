import { defineCommand } from 'citty';
import { loadConfig } from 'unconfig';

import { build } from '@/core/builder';
import { ApiKitConfig } from '@/core/defineConfig';

export const buildCommand = defineCommand({
  meta: {
    name: 'build',
    description: 'Build API application',
  },
  run: async () => {
    const { config } = await loadConfig<ApiKitConfig>({
      sources: [
        {
          files: 'apikit.config',
          extensions: ['ts', 'js', 'mjs', 'cjs'],
        },
      ],
    });

    if (!config) {
      console.error('❌ No apikit.config found');
      process.exit(1);
    }

    console.log('🚀 Building API with config:', config);
    await build(config);
  },
});
