import { defineNuxtModule } from '@nuxt/kit';
import type { HookResult } from '@nuxt/schema';

import type { NuxtKitOptions, NuxtKitPublicRuntimeConfig } from './types';
import type { UnauthorizedHookContext } from './runtime/types';
import { NUXT_MODULE_ID, NUXT_CONFIG_KEY, DEFAULT_OPTIONS } from './constants';
import { prepareContext } from './context';
import {
  prepareHooks,
  prepareRuntime,
  prepareRuntimeConfig,
  prepareAutoImports,
  prepareDependencies,
  prepareI18n,
  prepareZodLocales,
} from './prepare';

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
    const context = prepareContext(options, nuxt);

    /**
     * Validate dependencies availability
     */
    await prepareDependencies(context, nuxt);

    /**
     * Setup build hooks
     */
    await prepareHooks(context, nuxt);

    /**
     * Setup runtime config
     */
    // for public
    await prepareRuntimeConfig(context, nuxt);

    /**
     * Validate i18n availability
     */
    const i18nOptions = await prepareI18n(context, nuxt);

    /**
     * Add zod locales based on i18n locales
     */
    await prepareZodLocales(context, nuxt, i18nOptions);

    /**
     * Add plugin and templates
     */
    await prepareRuntime(context, nuxt);

    /**
     * auto imports
     */
    await prepareAutoImports(context, nuxt);
  },
});

export interface ModuleOptions extends NuxtKitOptions {}

export interface ModulePublicRuntimeConfig {
  [NUXT_CONFIG_KEY]: NuxtKitPublicRuntimeConfig;
}

export interface ModuleRuntimeHooks {
  'meowv:unauthorized': (context: UnauthorizedHookContext) => HookResult;
}

declare module '#app' {
  interface RuntimeNuxtHooks extends ModuleRuntimeHooks {}
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig extends ModulePublicRuntimeConfig {}
}
