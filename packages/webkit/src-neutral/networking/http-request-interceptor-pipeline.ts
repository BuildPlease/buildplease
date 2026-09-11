import type { Identity } from '@buildplease/core';

import type { HttpRequestInterceptor } from './http-request-interceptor';
import type { HttpRequestOptions } from './http-request-options';

export class HttpRequestInterceptorPipeline {
  private readonly interceptors: readonly HttpRequestInterceptor[];

  public constructor(interceptors: readonly HttpRequestInterceptor[] = []) {
    this.interceptors = this.resolveInterceptors(interceptors);
  }

  public async intercept(options: HttpRequestOptions): Promise<HttpRequestOptions> {
    let result = options;

    for (const interceptor of this.interceptors) {
      result = await interceptor.intercept(result);
    }

    return result;
  }

  private resolveInterceptors(interceptors: readonly HttpRequestInterceptor[]): readonly HttpRequestInterceptor[] {
    const identities = new Set<Identity>();
    const result: HttpRequestInterceptor[] = [];

    for (const interceptor of interceptors) {
      if (identities.has(interceptor.identity)) continue;

      identities.add(interceptor.identity);
      result.push(interceptor);
    }

    return Object.freeze(result);
  }
}
