import { type Resolver, createResolver, useLogger } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';

import { NUXT_MODULE_ID } from './constants';
import type { NuxtKitOptions } from './types';

export interface NuxtKitContext {
  resolver: Resolver;
  logger: ReturnType<typeof useLogger>;
  userOptions: NuxtKitOptions;
  options: Required<NuxtKitOptions>;
  isDev: boolean;
  isSSR: boolean;
  isPrepare: boolean;
  isTest: boolean;
}

const resolver = createResolver(import.meta.url);

export function prepareContext(userOptions: NuxtKitOptions, nuxt: Nuxt): NuxtKitContext {
  const options = userOptions as Required<NuxtKitOptions>;
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
