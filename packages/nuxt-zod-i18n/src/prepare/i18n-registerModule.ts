import type { Nuxt } from '@nuxt/schema';
import type { LocaleObject } from '@nuxtjs/i18n';

import type { Zodi18nNuxtContext } from '../context';

export function prepareI18nRegisterModule(
  { resolver }: Zodi18nNuxtContext,
  nuxt: Nuxt,
  locales: LocaleObject[],
) {
  nuxt.hook('i18n:registerModule', (register) => {
    register({
      langDir: resolver.resolve('./runtime/locales'),
      locales,
    });
  });
}
