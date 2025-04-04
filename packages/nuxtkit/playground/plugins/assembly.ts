import { LoginAssembly } from '../feature/login-assembly';

import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin({
  name: 'assembly-plugin',
  setup() {
    const container = useContainer();

    const assemblies = [new LoginAssembly()];

    assemblies.forEach((assembly) => {
      assembly.assemble(container);
    });
  },
});
