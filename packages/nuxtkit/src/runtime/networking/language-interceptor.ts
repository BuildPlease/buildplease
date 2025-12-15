import type { RemoteRequestInterceptor, RemoteRequestConfig } from '@nidavellirx/meowv-webkit';

import { useNuxtKit } from '#nuxtkit-internal/composables';
import { useCurrentLocale } from '#nuxtkit/composables';

export class LanguageInterceptor implements RemoteRequestInterceptor {
  order = 0;

  hash() {
    const { makeSymbol } = useNuxtKit();
    return makeSymbol('networking.interceptor.language');
  }

  equals(other: unknown) {
    return other instanceof LanguageInterceptor;
  }

  intercept(config: RemoteRequestConfig): RemoteRequestConfig {
    const { logger } = useNuxtKit();
    const currentLocale = useCurrentLocale({ withRegion: false });
    const value = currentLocale.value;

    logger.debug(`LanguageInterceptor → Accept-Language: ${value}`);

    return {
      ...config,
      headers: { ...config.headers, 'Accept-Language': value },
    };
  }
}
