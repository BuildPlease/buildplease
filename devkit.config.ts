import { defineDevKitConfig } from '@buildplease/devkit';

export default defineDevKitConfig({
  ignore: ['**/.apikit/**', '**/.archicat/**'],

  clean: {
    directories: ['.apikit', '.archicat'],
  },
});
