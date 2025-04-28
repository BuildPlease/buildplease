import type { Nuxt } from '@nuxt/schema';

import { defu } from 'defu';

import type { Zodi18nNuxtContext } from '../context';

export function prepareRuntimeConfig({ options }: Zodi18nNuxtContext, nuxt: Nuxt) {
  nuxt.options.runtimeConfig.public.zodi18n = defu(nuxt.options.runtimeConfig.public.zodi18n, {
    dateFormat: options.dateFormat,
    localeCodesMapping: options.localeCodesMapping,
  });
}
