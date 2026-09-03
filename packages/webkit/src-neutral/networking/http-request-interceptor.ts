import type { Identity } from '@buildplease/core';

import type { HttpRequestOptions } from './http-request-options';

/**
 * Modifies HTTP request options before a request is executed.
 */
export interface HttpRequestInterceptor {
  /** Stable identity used to ignore duplicate interceptors. */
  readonly identity: Identity;

  /** Applies this interceptor to the current request options. */
  intercept(options: HttpRequestOptions): HttpRequestOptions | Promise<HttpRequestOptions>;
}

export class HttpRequestInterceptorPipeline {
  private readonly interceptors: readonly HttpRequestInterceptor[];

  public constructor(interceptors: readonly HttpRequestInterceptor[] = [], onWarning?: (message: string) => void) {
    this.interceptors = this.resolveInterceptors(interceptors, onWarning);
  }

  public async intercept(options: HttpRequestOptions): Promise<HttpRequestOptions> {
    let result = options;

    for (const interceptor of this.interceptors) {
      result = await interceptor.intercept(result);
    }

    return result;
  }

  private resolveInterceptors(
    interceptors: readonly HttpRequestInterceptor[],
    onWarning?: (message: string) => void,
  ): readonly HttpRequestInterceptor[] {
    const identities = new Set<Identity>();
    const result: HttpRequestInterceptor[] = [];

    for (const interceptor of interceptors) {
      if (identities.has(interceptor.identity)) {
        onWarning?.(`Duplicate HTTP request interceptor ignored: ${String(interceptor.identity)}`);
        continue;
      }

      identities.add(interceptor.identity);
      result.push(interceptor);
    }

    return Object.freeze(result);
  }
}
