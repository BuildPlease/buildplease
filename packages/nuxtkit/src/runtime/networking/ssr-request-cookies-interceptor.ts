import { parseCookies } from 'h3';

import type { RemoteRequestConfig, RemoteRequestInterceptor } from '@meawkit/webkit';

import { useNuxtApp } from '#app';
import { isSSR } from '#nuxtkit/infrastructure';
import { useNuxtKit } from '#nuxtkit-internal/composables';

export class SSRRequestCookiesInterceptor implements RemoteRequestInterceptor {
  public order = -20;

  public hash() {
    const { makeSymbol } = useNuxtKit();
    return makeSymbol('networking.ssr.cookies');
  }

  public equals(other: unknown) {
    return other instanceof SSRRequestCookiesInterceptor;
  }

  public intercept(config: RemoteRequestConfig): RemoteRequestConfig {
    if (!isSSR) return config;

    const app = useNuxtApp();
    const event = app.ssrContext?.event;
    if (!event) return config;

    // MARK: - Get cookies from the SSR context
    const cookies = parseCookies(event);

    // MARK: - Format cookies to a single Cookie header
    const cookieHeader = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');

    return { ...config, headers: { ...config.headers, Cookie: cookieHeader } };
  }
}
