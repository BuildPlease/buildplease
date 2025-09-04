import type { Nuxt } from '@nuxt/schema';
import { addPlugin } from '@nuxt/kit';

import type { Zodi18nNuxtContext } from '../context';

export function prepareRuntime(ctx: Zodi18nNuxtContext, nuxt: Nuxt) {
  const { resolver } = ctx;

  addPlugin(resolver.resolve('./runtime/plugins/zodi18n'));

  // For composables
  nuxt.options.alias['#internal-zodi18n-types'] = resolver.resolve('./types');
  nuxt.options.build.transpile.push('#internal-zodi18n-types');

  nuxt.options.imports.transform ??= {};
  nuxt.options.imports.transform.include ??= [];
}
