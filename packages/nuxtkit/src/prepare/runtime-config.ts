import type { Nuxt } from '@nuxt/schema';
import { defu } from 'defu';

import type { NuxtKitContext } from '../context';

export function prepareRuntimeConfig({ options }: NuxtKitContext, nuxt: Nuxt) {
  nuxt.options.runtimeConfig.public.meowvNuxtKit = defu(nuxt.options.runtimeConfig.public.meowvNuxtKit, {
    unauthorizedStatusCodes: options.unauthorizedStatusCodes,
    errors: options.errors,
  });
}
