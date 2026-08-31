import 'reflect-metadata';
import { runWebKit } from '@buildplease/webkit';

import { DashboardAssembly } from '~/feature/dashboard/assembly';
import { LoginAssembly } from '~/feature/login/assembly';
import { NetworkingAssembly } from '~/networking/assembly';

export default defineNuxtPlugin({
  name: 'webkit',
  order: -1,
  async setup(nuxt) {
    const runtime = await runWebKit({
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
