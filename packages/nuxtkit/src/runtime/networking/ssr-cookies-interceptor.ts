import type { RequestInterceptor, RequestConfig } from '@nidavellirx/meowv-webkit';

import { parseCookies } from 'h3';

import { isSSR } from '../infrastructure/environment';

import type { NuxtApp } from '#app';

export class SSRRequestCookiesInterceptor implements RequestInterceptor {
  order = -20;

  constructor(private nuxt: NuxtApp) {}

  hash() {
    return Symbol.for('meowv.nuxtkit.networking.interceptor.ssr.cookies');
  }
  equals(other: unknown) {
    return other instanceof SSRRequestCookiesInterceptor;
  }

  intercept(config: RequestConfig): RequestConfig {
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
