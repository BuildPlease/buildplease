import { webkitAssembly } from '@buildplease/webkit';

import { DashboardAssembly } from '~/feature/dashboard/assembly';
import { LoginAssembly } from '~/feature/login/assembly';
import { NetworkingAssembly } from '~/networking/assembly';

export default defineNuxtPlugin({
  name: 'assembly-plugin',
  setup(nuxt) {
    const scopeController = useScopeController();
    const container = scopeController.container;

    const webkitAssemblies = webkitAssembly();
    const appAssemblies = [new NetworkingAssembly(nuxt), new LoginAssembly(), new DashboardAssembly()];
    const allAssemblies = [...webkitAssemblies, ...appAssemblies];

    allAssemblies.forEach((assembly) => assembly.assemble(container));
  },
});
