import { defineNuxtModule } from '@nuxt/kit';
import type { HookResult } from '@nuxt/schema';

import type { NuxtKitOptions, NuxtKitPublicRuntimeConfig, UnauthorizedHookContext } from './types';
import { NUXT_MODULE_ID, NUXT_CONFIG_KEY, DEFAULT_OPTIONS } from './constants';

import { prepareContext } from './context';
import { prepareHooks } from './prepare/hooks';
import { prepareRuntime } from './prepare/runtime';
import { prepareRuntimeConfig } from './prepare/runtime-config';
import { prepareValidation } from './prepare/validation';
import { prepareAutoImports } from './prepare/auto-imports';

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: NUXT_MODULE_ID,
    configKey: NUXT_CONFIG_KEY,
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: DEFAULT_OPTIONS,
  async setup(options, nuxt) {
    const ctx = prepareContext(options, nuxt);

    /**
     * Setup build hooks
     */
    prepareHooks(ctx, nuxt);

    /**
     * Setup runtime config
     */
    // for public
    prepareRuntimeConfig(ctx, nuxt);

    /**
     * Validate i18n availability
     */
    const _i18nOptions = prepareValidation(ctx, nuxt);

    /**
     * Add plugin and templates
     */
    prepareRuntime(ctx, nuxt);

    /**
     * auto imports
     */
    await prepareAutoImports(ctx, nuxt);
  },
});

export interface ModuleOptions extends NuxtKitOptions {}

export interface ModulePublicRuntimeConfig {
  [NUXT_CONFIG_KEY]: Partial<NuxtKitPublicRuntimeConfig>;
}

export interface ModuleRuntimeHooks {
  'meowv:unauthorized': (ctx: UnauthorizedHookContext) => HookResult;
}

declare module '#app' {
  interface RuntimeNuxtHooks extends ModuleRuntimeHooks {}
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig extends ModulePublicRuntimeConfig {}
}
