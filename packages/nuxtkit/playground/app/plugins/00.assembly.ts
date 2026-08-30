import { DashboardAssembly } from '~/feature/dashboard/assembly';
import { LoginAssembly } from '~/feature/login/assembly';
import { NetworkingAssembly } from '~/networking/assembly';

export default defineNuxtPlugin({
  name: 'assembly-plugin',
  order: -1,
  setup(nuxt) {
    return {
      provide: {
        webkitAssemblies: () => [new NetworkingAssembly(nuxt), new LoginAssembly(), new DashboardAssembly()],
      },
    };
  },
});
