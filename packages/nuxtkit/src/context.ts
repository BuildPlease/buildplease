import { type Resolver, createResolver, useLogger } from '@nuxt/kit';
import type { Nuxt } from '@nuxt/schema';
import type { DeepRequired } from '@meawkit/webkit';

import { MODULE_NAME } from './shared/constants';
import type { NuxtKitOptions } from './types';

export interface NuxtKitContext {
  resolver: Resolver;
  logger: ReturnType<typeof useLogger>;
  userOptions: NuxtKitOptions;
  options: DeepRequired<NuxtKitOptions>;
  isDev: boolean;
  isSSR: boolean;
  isPrepare: boolean;
  isTest: boolean;
}

const resolver = createResolver(import.meta.url);

export function prepareContext(userOptions: NuxtKitOptions, nuxt: Nuxt): NuxtKitContext {
  const options = userOptions as DeepRequired<NuxtKitOptions>;

  return {
    resolver,
    logger: useLogger(MODULE_NAME),
    userOptions: userOptions,
    options: options,
    isDev: nuxt.options.dev,
    isSSR: nuxt.options.ssr,
    isPrepare: nuxt.options._prepare,
    isTest: nuxt.options.test,
  };
}
