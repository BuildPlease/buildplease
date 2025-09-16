import type { Nuxt } from '@nuxt/schema';

import type { NuxtKitContext } from '../context';

export async function prepareHooks(_context: NuxtKitContext, nuxt: Nuxt) {
  nuxt.options.vite.esbuild = {
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  };

  nuxt.hook('nitro:build:before', (nitro) => {
    nitro.options.moduleSideEffects.push('reflect-metadata');
  });
}
