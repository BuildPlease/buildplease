import type { Nuxt } from '@nuxt/schema';

import type { NuxtKitContext } from '../context';

export async function prepareHooks(_context: NuxtKitContext, nuxt: Nuxt): Promise<void> {
  nuxt.options.typescript.tsConfig = {
    ...nuxt.options.typescript.tsConfig,
    compilerOptions: {
      ...nuxt.options.typescript.tsConfig.compilerOptions,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
  };

  const oxc = nuxt.options.vite.oxc === false ? {} : nuxt.options.vite.oxc;

  nuxt.options.vite.oxc = {
    ...oxc,
    decorator: {
      ...oxc?.decorator,
      legacy: true,
      emitDecoratorMetadata: true,
    },
  };

  nuxt.hook('nitro:build:before', (nitro) => {
    nitro.options.moduleSideEffects.push('reflect-metadata');
  });
}
