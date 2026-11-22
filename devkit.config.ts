import { defineDevKitConfig } from '@buildplease/devkit';

export default defineDevKitConfig({
  ignore: ['**/.apikit/**', '**/.webkit/**'],

  clean: {
    directories: ['.apikit', '.webkit'],
  },
});
