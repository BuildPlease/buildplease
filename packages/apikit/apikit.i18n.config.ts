import { resolvePath } from '@meawkit/core/node';

import { defineApiKitI18n } from './src/configuration/i18n';

export default defineApiKitI18n({
  name: '@meawkit/apikit',
  resources: {
    directories: [
      {
        path: resolvePath(import.meta.url, './src/i18n/locales'),
      },
    ],
  },
});
