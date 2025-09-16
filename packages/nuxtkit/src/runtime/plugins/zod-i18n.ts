import { z } from 'zod';

import { defineNuxtPlugin, useNuxtApp } from '#app';
import { useNuxtKit } from '#nuxtkit/composables/use-nuxt-kit';
import { makeErrorMap } from '#nuxtkit/zod/shared';

export default defineNuxtPlugin({
  name: 'nuxtkit:plugin:zod-i18n',
  // @ts-expect-error provided by @nuxtjs/i18n
  dependsOn: ['i18n:plugin'],
  parallel: true,
  setup(_nuxt) {
    const app = useNuxtApp();
    const { config, logger, moduleName } = useNuxtKit();
    const i18n = app.$i18n;

    if (!i18n) {
      logger.warn(`${moduleName} - Zod: i18n not available; skipping error-map binding`, { force: true });
      return;
    }

    const errorMap = makeErrorMap(i18n);
    z.config({ localeError: errorMap });

    const message = `${moduleName} - Zod: i18n configured for locale:"${i18n.locale.value}", prefix="${config.zodI18n.keyPrefix}"`;
    logger.info(message, { force: true });
  },
});
