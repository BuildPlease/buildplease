import { defineDevKitConfig } from '@buildplease/devkit';

export default defineDevKitConfig({
  ignore: ['**/.apikit/**'],

  clean: {
    directories: ['.apikit'],
  },
});
