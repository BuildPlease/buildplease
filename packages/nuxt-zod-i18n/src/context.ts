import type { Resolver } from '@nuxt/kit';

import type { Nuxt } from '@nuxt/schema';
import { createResolver, useLogger } from '@nuxt/kit';

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
  isSSG: boolean;
  isBuild: boolean;
  isTest: boolean;
}

const resolver = createResolver(import.meta.url);

export function createContext(
  userOptions: NuxtZodi18nOptions,
  nuxt: Nuxt,
): Zodi18nNuxtContext {
  const options = userOptions as Required<NuxtZodi18nOptions>;

  return {
    resolver,
    logger: useLogger(NUXT_MODULE_ID),
    userOptions,
    options,
    isDev: nuxt.options.dev,
    isSSR: nuxt.options.ssr,
    isPrepare: nuxt.options._prepare,
    isSSG: nuxt.options._generate,
    isBuild: nuxt.options._build,
    isTest: nuxt.options.test,
  };
}
