import { defineNuxtModule } from '@nuxt/kit';
import type { HookResult } from '@nuxt/schema';

import { type MODULE_HOOK_UNAUTHORIZED_NAME, MODULE_CONFIG_KEY_NAME, MODULE_NAME } from '#internal-shared';

import { prepareContext } from './context';
import { DEFAULT_OPTIONS } from './defaults';
import { prepareAutoImports, prepareHooks, prepareI18n, prepareRuntime, prepareRuntimeConfig } from './prepare';
import type { UnauthorizedHookContext } from './runtime/types';
import type { NuxtKitOptions, NuxtKitPublicRuntimeConfig } from './types';

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: MODULE_CONFIG_KEY_NAME,
    compatibility: {
      nuxt: '>=4.1.0',
    },
  },
  defaults: DEFAULT_OPTIONS,
  moduleDependencies: {
    '@nuxt/ui': {},
    '@nuxtjs/i18n': {
      overrides: {
        types: 'composition',
        bundle: {
          compositionOnly: true,
        },
      },
    },
  },
  async setup(options, nuxt) {
    const context = prepareContext(options);

    await prepareHooks(context, nuxt);
    await prepareRuntimeConfig(context, nuxt);
    await prepareI18n(context, nuxt);
    await prepareRuntime(context, nuxt);
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
