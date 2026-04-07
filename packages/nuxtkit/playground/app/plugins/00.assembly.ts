import { DashboardAssembly } from '@feature/dashboard/assembly';
import { LoginAssembly } from '@feature/login/assembly';
import { webkitAssembly } from '@meawkit/webkit';

export default defineNuxtPlugin({
  name: 'assembly-plugin',
  setup(_nuxt) {
    const scopeController = useScopeController();
    const container = scopeController.container;

    const webkitAssemblies = webkitAssembly();
    const appAssemblies = [new LoginAssembly(), new DashboardAssembly()];
    const allAssemblies = [...webkitAssemblies, ...appAssemblies];

    allAssemblies.forEach((a) => a.assemble(container));
  },
});
