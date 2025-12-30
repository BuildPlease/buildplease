import { z } from 'zod';

import { defineNuxtPlugin, useNuxtApp } from '#app';
import { useNuxtKit } from '#nuxtkit-internal/composables';
import { makeErrorMap } from '#nuxtkit/zod/shared';

export default defineNuxtPlugin({
  name: 'nuxtkit:plugin:zod-i18n',
  // @ts-ignore provided by @nuxtjs/i18n
  dependsOn: ['i18n:plugin'],
  parallel: true,
  setup(_nuxt) {
    const app = useNuxtApp();
    const { config, logger } = useNuxtKit();
    const i18n = app.$i18n;

    if (!i18n) {
      logger.warn(`Zod: i18n not available; skipping error-map binding`, { force: true });
      return;
    }

    const errorMap = makeErrorMap(i18n);
    z.config({ localeError: errorMap });

    const message = `Zod: i18n configured for locale:"${i18n.locale.value}", prefix="${config.zodI18n.keyPrefix}"`;
    logger.info(message, { force: true });
  },
});
