import { defineDevKitConfig } from '@meawkit/devkit';

export default defineDevKitConfig({
  ignore: ['**/.apikit-app/**'],

  clean: {
    directories: ['.apikit-app'],
  },
});
