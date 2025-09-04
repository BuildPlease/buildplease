import { type Resolver, createResolver, useLogger } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';

import { NUXT_MODULE_ID } from './constants';
import type { NuxtZodi18nOptions } from './types';

export interface Zodi18nNuxtContext {
  resolver: Resolver;
  logger: ReturnType<typeof useLogger>;
  userOptions: NuxtZodi18nOptions;
  options: Required<NuxtZodi18nOptions>;
  isDev: boolean;
  isSSR: boolean;
  isPrepare: boolean;
  isTest: boolean;
}

const resolver = createResolver(import.meta.url);

export function prepareContext(userOptions: NuxtZodi18nOptions, nuxt: Nuxt): Zodi18nNuxtContext {
  const options = userOptions as Required<NuxtZodi18nOptions>;

  return {
    resolver,
    logger: useLogger(NUXT_MODULE_ID),
    userOptions,
    options,
    isDev: nuxt.options.dev,
    isSSR: nuxt.options.ssr,
    isPrepare: nuxt.options._prepare,
    isTest: nuxt.options.test,
  };
}
