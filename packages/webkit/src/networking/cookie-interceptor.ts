import { FrameworkIdentity } from '@meawkit/identity';
import type { Identity } from '@meawkit/core';

import type { RemoteRequestConfig, RemoteRequestInterceptor } from '@/networking';

export class CookieInterceptor implements RemoteRequestInterceptor {
  order = -10;

  hash(): Identity {
    return Symbol.for(`${FrameworkIdentity.scopeName}.webkit.networking.interceptor.cookie`);
  }

  equals(other: unknown): boolean {
    return other instanceof CookieInterceptor;
  }

  intercept(config: RemoteRequestConfig): RemoteRequestConfig {
    return { ...config, withCredentials: true };
  }
}
