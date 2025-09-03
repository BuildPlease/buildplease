import type { Identity } from '@nidavellirx/meowv-core';

import type { RequestConfig, RequestInterceptor } from '@/networking';

export const CookieInterceptorKey = Symbol.for('meowv.webkit.networking.interceptor.cookie');

export class CookieInterceptor implements RequestInterceptor {
  order = -10;

  hash(): Identity {
    return CookieInterceptorKey;
  }

  equals(other: unknown): boolean {
    return other instanceof CookieInterceptor;
  }

  intercept(config: RequestConfig): RequestConfig {
    return { ...config, withCredentials: true };
  }
}
