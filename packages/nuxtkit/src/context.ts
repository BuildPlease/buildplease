import type { DeepRequired } from '@meawkit/webkit';
import { type Resolver, createResolver, useLogger } from '@nuxt/kit';

import { MODULE_NAME } from '#internal-shared';

import type { NuxtKitOptions } from './types';

export interface NuxtKitContext {
  resolver: Resolver;
  logger: ReturnType<typeof useLogger>;
  options: DeepRequired<NuxtKitOptions>;
}

const resolver = createResolver(import.meta.url);

export function prepareContext(userOptions: NuxtKitOptions): NuxtKitContext {
  const options = userOptions as DeepRequired<NuxtKitOptions>;

  return {
    resolver: resolver,
    logger: useLogger(MODULE_NAME),
    options: options,
  };
}
