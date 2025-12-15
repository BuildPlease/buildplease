import type { RemoteRequestInterceptor, RemoteRequestConfig } from '@nidavellirx/meowv-webkit';

import { parseCookies } from 'h3';

import type { NuxtApp } from '#app';
import { useNuxtKit } from '#nuxtkit/composables/use-nuxt-kit';
import { isSSR } from '#nuxtkit/infrastructure/environment';

export class SSRRequestCookiesInterceptor implements RemoteRequestInterceptor {
  constructor(private nuxt: NuxtApp) {}

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

    const event = this.nuxt.ssrContext?.event;
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
