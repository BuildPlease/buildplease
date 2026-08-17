import type { RemoteRequestConfig, RemoteRequestInterceptor } from '@buildplease/webkit';

import { useNuxtKit } from '#internal-runtime';
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

    logger.debug(`[NuxtKit:Language] Accept-Language: ${value}`);

    return {
      ...config,
      headers: { ...config.headers, 'Accept-Language': value },
    };
  }
}
