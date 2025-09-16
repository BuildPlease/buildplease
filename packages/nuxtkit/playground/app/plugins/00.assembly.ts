import { LoginAssembly } from '@feature/login/assembly';
import { DashboardAssembly } from '@feature/dashboard/assembly';

export default defineNuxtPlugin({
  name: 'assembly-plugin',
  setup(_nuxt) {
    const scopeController = useScopeController();
    const container = scopeController.container;
    const assemblies = [new LoginAssembly(), new DashboardAssembly()];

    assemblies.forEach((a) => a.assemble(container));
  },
});
