import { defineDevKitConfig } from '@buildplease/devkit';

export default defineDevKitConfig({
  ignore: ['**/.buildplease/**'],

  clean: {
    directories: ['.buildplease'],
  },
});
