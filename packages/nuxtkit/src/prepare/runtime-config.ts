import type { Nuxt } from '@nuxt/schema';
import { defu } from 'defu';

import { MODULE_CONFIG_KEY_NAME } from '#internal-shared';

import type { NuxtKitContext } from '../context';
import type { NuxtKitPublicRuntimeConfig } from '../types';

export async function prepareRuntimeConfig(context: NuxtKitContext, nuxt: Nuxt) {
  const options = context.options;

  const defaults = {
    debug: options.debug,
    zodI18n: options.zodI18n,
    components: options.components,
    errors: options.errors,
    unauthorizedStatusCodes: options.unauthorizedStatusCodes,
  } satisfies NuxtKitPublicRuntimeConfig;

  const publicConfig = nuxt.options.runtimeConfig.public;
  const current = publicConfig[MODULE_CONFIG_KEY_NAME];

  publicConfig[MODULE_CONFIG_KEY_NAME] = defu(current, defaults);
}
