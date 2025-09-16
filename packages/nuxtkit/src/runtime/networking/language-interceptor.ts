import type { RequestInterceptor, RequestConfig } from '@nidavellirx/meowv-webkit';

import { useCurrentLocale } from '#imports';
import { useNuxtKit } from '#nuxtkit/composables/use-nuxt-kit';

export class LanguageInterceptor implements RequestInterceptor {
  order = 0;

  hash() {
    const { makeSymbol } = useNuxtKit();
    return makeSymbol('networking.interceptor.language');
  }

  equals(other: unknown) {
    return other instanceof LanguageInterceptor;
  }

  intercept(config: RequestConfig): RequestConfig {
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
