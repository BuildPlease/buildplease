import { defineDevKitConfig } from '@meawkit/devkit';

export default defineDevKitConfig({
  ignore: ['**/.apikit/**'],

  clean: {
    directories: ['.apikit'],
  },
});
