import { defineNuxtModule } from '@nuxt/kit';

import type { NuxtZodi18nOptions, Zodi18nPublicRuntimeConfig } from './types';
import { NUXT_MODULE_ID, NUXT_CONFIG_KEY, DEFAULT_OPTIONS } from './constants';

import { prepareContext } from './context';
import { prepareRuntime } from './prepare/runtime';
import { prepareRuntimeConfig } from './prepare/runtime-config';
import { prepareValidation } from './prepare/validation';
import { prepareLocales } from './prepare/locales';
import { prepareI18nRegisterModule } from './prepare/i18n-registerModule';
import { prepareAutoImports } from './prepare/auto-imports';

export default defineNuxtModule<ModuleOptions>().with({
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
     * Setup runtime config
     */
    // for public
    prepareRuntimeConfig(ctx, nuxt);

    /**
     * Validate i18n availability
     */
    const i18nOptions = prepareValidation(ctx, nuxt);

    /**
     * Prepare Locales
     */
    const locales = await prepareLocales(ctx, nuxt, i18nOptions);

    /**
     *  Register Locales at i18n:registerModule hook
     */
    prepareI18nRegisterModule(ctx, nuxt, locales);

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

export interface ModuleOptions extends NuxtZodi18nOptions {}

export interface ModulePublicRuntimeConfig {
  [NUXT_CONFIG_KEY]: Zodi18nPublicRuntimeConfig;
}
