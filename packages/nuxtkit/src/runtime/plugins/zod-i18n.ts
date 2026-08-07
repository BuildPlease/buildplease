import { z } from 'zod';

import { defineNuxtPlugin } from '#app';
import { useNuxtKit } from '#internal-runtime';
import { makeErrorMap } from '#nuxtkit/zod/shared';

export default defineNuxtPlugin({
  name: 'nuxtkit:plugin:zod-i18n',
  parallel: true,
  setup(nuxtApp) {
    const { config, logger } = useNuxtKit();
    const i18n = nuxtApp.$i18n;

    const errorMap = makeErrorMap(i18n);
    z.config({ localeError: errorMap });

    const message = `Zod i18n integration configured: locale="${i18n.locale.value}", prefix="${config.zodI18n.keyPrefix}"`;
    logger.info(message, { force: true });
  },
});
