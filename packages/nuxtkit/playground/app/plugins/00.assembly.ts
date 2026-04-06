import { MEOWV_WEBKIT_INITIALIZE } from '@meawkit/webkit';

import { LoginAssembly } from '@feature/login/assembly';
import { DashboardAssembly } from '@feature/dashboard/assembly';

export default defineNuxtPlugin({
  name: 'assembly-plugin',
  setup(_nuxt) {
    const scopeController = useScopeController();
    const container = scopeController.container;

    const webkitAssemblies = MEOWV_WEBKIT_INITIALIZE();
    const appAssemblies = [new LoginAssembly(), new DashboardAssembly()];
    const allAssemblies = [...webkitAssemblies, ...appAssemblies];

    allAssemblies.forEach((a) => a.assemble(container));
  },
});
