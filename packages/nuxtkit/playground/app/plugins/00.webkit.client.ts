import 'reflect-metadata';
import { WebKitApplication } from '@buildplease/webkit/browser';

import { DashboardAssembly } from '~/feature/dashboard/assembly';
import { LoginAssembly } from '~/feature/login/assembly';
import { NetworkingAssembly } from '~/networking/assembly';

export default defineNuxtPlugin({
  name: 'webkit',
  order: -1,
  async setup(nuxt) {
    const runtime = await WebKitApplication.run({
      hooks: {
        assemblies: () => [new NetworkingAssembly(nuxt), new LoginAssembly(), new DashboardAssembly()],
      },
    });

    return {
      provide: {
        scopeController: runtime.scope,
      },
    };
  },
});
