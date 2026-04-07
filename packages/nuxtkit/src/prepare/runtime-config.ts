import { defu } from 'defu';

import type { Nuxt } from '@nuxt/schema';

import type { NuxtKitContext } from '../context';
import type { NuxtKitPublicRuntimeConfig } from '../types';

import { MODULE_CONFIG_KEY_NAME } from '../shared/constants';

type ModulePublicRuntimeStore = {
  [K in typeof MODULE_CONFIG_KEY_NAME]?: Partial<NuxtKitPublicRuntimeConfig>;
};

export async function prepareRuntimeConfig(context: NuxtKitContext, nuxt: Nuxt) {
  const options = context.options;

  const defaults = {
    debug: options.debug,
    components: options.components,
    unauthorizedStatusCodes: options.unauthorizedStatusCodes,
    errors: options.errors,
    zodI18n: options.zodI18n,
  } satisfies NuxtKitPublicRuntimeConfig;

  const publicConfig = nuxt.options.runtimeConfig.public as ModulePublicRuntimeStore;
  const current = publicConfig[MODULE_CONFIG_KEY_NAME];

  publicConfig[MODULE_CONFIG_KEY_NAME] = defu(current, defaults);
}
