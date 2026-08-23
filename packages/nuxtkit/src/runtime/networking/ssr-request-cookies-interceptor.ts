import type { HttpRequestInterceptor, HttpRequestOptions, Identity } from '@buildplease/webkit';

import type { NuxtApp } from '#app';
import { useRequestHeader } from '#imports';
import { MODULE_SYMBOL_NAME } from '#internal-shared';

export class SSRRequestCookiesInterceptor implements HttpRequestInterceptor {
  public readonly identity: Identity = Symbol.for(`${MODULE_SYMBOL_NAME}.networking.interceptor.ssr-cookies`);

  public constructor(private readonly app: NuxtApp) {}

  public async intercept(options: HttpRequestOptions): Promise<HttpRequestOptions> {
    const cookie = await this.app.runWithContext(() => useRequestHeader('cookie'));
    if (!cookie) return options;

    return {
      ...options,
      headers: {
        ...options.headers,
        Cookie: cookie,
      },
    };
  }
}
