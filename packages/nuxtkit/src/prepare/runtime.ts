import type { Nuxt } from '@nuxt/schema';
import { addPlugin } from '@nuxt/kit';

import type { NuxtKitContext } from '../context';

export function prepareRuntime(ctx: NuxtKitContext, nuxt: Nuxt) {
  const { resolver } = ctx;

  addPlugin({
    src: resolver.resolve('./runtime/plugins/di'),
    mode: 'all',
    order: 0,
  });

  // For composables
  nuxt.options.alias['#internal-nuxtkit-types'] = resolver.resolve('./types');

  nuxt.options.build.transpile.push('#internal-nuxtkit-types');
  nuxt.options.build.transpile.push(resolver.resolve('./runtime'));

  nuxt.options.imports.transform ??= {};
  nuxt.options.imports.transform.include ??= [];
}
