import { z } from 'zod';

import { defineNuxtPlugin, useNuxtApp } from '#app';
import { useNuxtKit } from '#internal-runtime';
import { makeErrorMap } from '#nuxtkit/zod/shared';

export default defineNuxtPlugin({
  name: 'nuxtkit:plugin:zod-i18n',
  dependsOn: ['i18n:plugin'] as any,
  parallel: true,
  setup(_nuxt) {
    const app = useNuxtApp();
    const { config, logger } = useNuxtKit();
    const i18n = app.$i18n;

    if (!i18n) {
      logger.debug('[NuxtKit:ZodI18n] Integration disabled: i18n is unavailable');
      return;
    }

    const errorMap = makeErrorMap(i18n);
    z.config({ localeError: errorMap });

    const message = `Zod i18n integration configured: locale="${i18n.locale.value}", prefix="${config.zodI18n.keyPrefix}"`;
    logger.info(message, { force: true });
  },
});
