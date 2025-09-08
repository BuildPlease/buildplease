import type { Nuxt } from '@nuxt/schema';
import { defu } from 'defu';

import type { NuxtKitPublicRuntimeConfig } from '../types';
import type { NuxtKitContext } from '../context';

export function prepareRuntimeConfig({ options }: NuxtKitContext, nuxt: Nuxt) {
  const defaults = {
    debug: options.debug,
    components: options.components,
    unauthorizedStatusCodes: options.unauthorizedStatusCodes,
    errors: options.errors,
    zodI18n: options.zodI18n,
  } satisfies NuxtKitPublicRuntimeConfig;

  nuxt.options.runtimeConfig.public.meowvNuxtKit = defu(
    nuxt.options.runtimeConfig.public.meowvNuxtKit,
    defaults,
  );
}
