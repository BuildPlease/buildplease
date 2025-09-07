import type { RequestInterceptor, RequestConfig } from '@nidavellirx/meowv-webkit';

import { useNuxtApp } from '#imports';
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
    const app = useNuxtApp();
    const { logger } = useNuxtKit();
    const locale = String(app.$i18n?.locale?.value ?? 'en');

    logger.log('LanguageInterceptor → Accept-Language:', locale);

    return {
      ...config,
      headers: { ...config.headers, 'Accept-Language': locale },
    };
  }
}
