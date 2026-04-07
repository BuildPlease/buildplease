import { defineNuxtModule } from '@nuxt/kit';

import type { HookResult } from '@nuxt/schema';

import type { UnauthorizedHookContext } from './runtime/types';
import type { NuxtKitOptions, NuxtKitPublicRuntimeConfig } from './types';

import { prepareContext } from './context';
import { DEFAULT_OPTIONS } from './defaults';
import {
  prepareAutoImports,
  prepareDependencies,
  prepareHooks,
  prepareI18n,
  prepareRuntime,
  prepareRuntimeConfig,
  prepareZodLocales,
} from './prepare';
import { type MODULE_HOOK_UNAUTHORIZED_NAME, MODULE_CONFIG_KEY_NAME, MODULE_NAME } from './shared/constants';


export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: MODULE_CONFIG_KEY_NAME,
    compatibility: {
      nuxt: '>=4.0.0',
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
  [MODULE_CONFIG_KEY_NAME]: NuxtKitPublicRuntimeConfig;
}

export interface ModuleRuntimeHooks {
  [MODULE_HOOK_UNAUTHORIZED_NAME]: (context: UnauthorizedHookContext) => HookResult;
}

declare module '#app' {
  interface RuntimeNuxtHooks extends ModuleRuntimeHooks {}
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig extends ModulePublicRuntimeConfig {}
}
