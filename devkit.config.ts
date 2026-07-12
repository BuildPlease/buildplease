import { defineDevKitConfig } from '@meawkit/devkit';

export default defineDevKitConfig({
  ignore: ['**/.apikit-app/**', '**/.apikit-i18n/**'],

  clean: {
    directories: ['.apikit-app', '.apikit-i18n'],
  },
});
