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
