import type { RequestInterceptor, RequestConfig } from '@nidavellirx/meowv-webkit';

import { useNuxtApp } from '#app';

export class LanguageInterceptor implements RequestInterceptor {
  order = 0;

  hash() {
    return Symbol.for('meowv.nuxtkit.networking.interceptor.language');
  }
  equals(other: unknown) {
    return other instanceof LanguageInterceptor;
  }

  intercept(config: RequestConfig): RequestConfig {
    const i18n = useNuxtApp().$i18n;
    const locale = i18n.locale.value ?? 'en';

    return {
      ...config,
      headers: { ...config.headers, 'Accept-Language': String(locale) },
    };
  }
}
