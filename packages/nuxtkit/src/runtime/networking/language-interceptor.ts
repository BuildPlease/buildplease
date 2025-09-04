import { useI18n } from 'vue-i18n';
import type { RequestInterceptor, RequestConfig } from '@nidavellirx/meowv-webkit';

export class LanguageInterceptor implements RequestInterceptor {
  order = 0;

  hash() {
    return Symbol.for('meowv.nuxtkit.networking.interceptor.language');
  }
  equals(other: unknown) {
    return other instanceof LanguageInterceptor;
  }

  intercept(config: RequestConfig): RequestConfig {
    const { locale } = useI18n({ useScope: 'global' });
    const value = typeof locale === 'string' ? locale : (locale.value ?? 'en');

    return {
      ...config,
      headers: { ...config.headers, 'Accept-Language': value },
    };
  }
}
