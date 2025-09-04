import type { Nuxt } from '@nuxt/schema';

import type { NuxtKitContext } from '../context';

export function prepareHooks(_ctx: NuxtKitContext, nuxt: Nuxt) {
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
