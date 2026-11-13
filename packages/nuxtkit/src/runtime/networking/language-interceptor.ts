import type { Identity } from '@buildplease/core';
import type { HttpRequestInterceptor, HttpRequestOptions } from '@buildplease/webkit';

import type { NuxtApp } from '#app';
import { MODULE_SYMBOL_NAME } from '#internal-shared';
import { useCurrentLocale } from '#nuxtkit/composables';

export class LanguageInterceptor implements HttpRequestInterceptor {
  public readonly identity: Identity = Symbol.for(`${MODULE_SYMBOL_NAME}.networking.interceptor.language`);

  public constructor(private readonly app: NuxtApp) {}

  public async intercept(options: HttpRequestOptions): Promise<HttpRequestOptions> {
    const language = await this.app.runWithContext(() => useCurrentLocale({ withRegion: false }).value);

    return {
      ...options,
      headers: {
        ...options.headers,
        'Accept-Language': language,
      },
    };
  }
}
