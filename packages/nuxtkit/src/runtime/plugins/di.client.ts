import 'reflect-metadata';
import { type Assembly, runWebKit } from '@buildplease/webkit';

import { defineNuxtPlugin } from '#imports';

interface WebKitAssemblyHost {
  readonly $webkitAssemblies?: () => Assembly[];
}

export default defineNuxtPlugin({
  name: 'nuxtkit:plugin:di',
  async setup(nuxt) {
    const host = nuxt as typeof nuxt & WebKitAssemblyHost;
    const runtime = await runWebKit({
      hooks: {
        assemblies: () => host.$webkitAssemblies?.() ?? [],
      },
    });

    return {
      provide: {
        scopeController: runtime.scope,
        getInstance: <T>(id: symbol): T => runtime.scope.getInstance<T>(id),
      },
    };
  },
});
