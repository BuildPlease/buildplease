import type { Nuxt } from '@nuxt/schema';
import { addImportsDir } from '@nuxt/kit';

import type { Zodi18nNuxtContext } from '../context';

export async function prepareAutoImports({ resolver }: Zodi18nNuxtContext, _nuxt: Nuxt) {
  addImportsDir([resolver.resolve('./runtime/composables')]);
}
