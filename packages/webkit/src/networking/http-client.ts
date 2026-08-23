import { CanceledError, NetworkError, TimeoutError, UnknownError } from '@buildplease/core';

import { type AsyncQueue, AsyncQueueImpl } from './async-queue';
import { HttpError } from './http-error';
import type { HttpRequest } from './http-request';
import { HttpRequestInterceptorPipeline } from './http-request-interceptor';
import type { HttpRequestOptions } from './http-request-options';
import type { UnauthorizedOptions } from './unauthorized';

const DEFAULT_REQUEST_OPTIONS: HttpRequestOptions = {
  credentials: true,
  headers: {},
};

export interface HttpClientOptions {
  /**
   * Default options applied to every request before interceptors and request-specific options.
   *
   * @default {}
   */
  readonly requestOptions?: HttpRequestOptions;

  /**
   * Interceptors applied to every request.
   *
   * @default Empty `HttpRequestInterceptorPipeline`
   */
  readonly interceptorPipeline?: HttpRequestInterceptorPipeline;

  /**
   * Queue used to execute requests.
   *
   * @default `AsyncQueueImpl` in `parallel` mode
   */
  readonly asyncQueue?: AsyncQueue;

  /**
   * Unauthorized handling for secured requests.
   *
   * @default undefined
   */
  readonly unauthorized?: UnauthorizedOptions;
}

export abstract class HttpClient<Client> {
  private readonly requestOptions: HttpRequestOptions;
  private readonly interceptorPipeline: HttpRequestInterceptorPipeline;
  public readonly asyncQueue: AsyncQueue;
  public readonly unauthorized?: UnauthorizedOptions;

  public constructor(options: HttpClientOptions = {}) {
    this.requestOptions = options.requestOptions ?? {};
    this.interceptorPipeline = options.interceptorPipeline ?? new HttpRequestInterceptorPipeline();
    this.asyncQueue = options.asyncQueue ?? new AsyncQueueImpl();
    this.unauthorized = options.unauthorized;
  }

  public execute<Output>(request: HttpRequest<Client, Output>, options?: HttpRequestOptions): Promise<Output> {
    return this.asyncQueue.execute(async () => {
      const requestOptions = await this.makeRequestOptions(request, options);

      try {
        const client = this.createClient(requestOptions);
        return await request.execute(client);
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  /** Creates the concrete client for the resolved request options. */
  protected abstract createClient(options: HttpRequestOptions): Client;

  /** Maps a transport-specific failure to a BuildPlease error. */
  protected handleError(error: unknown): Error {
    if (
      error instanceof HttpError ||
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      error instanceof CanceledError ||
      error instanceof UnknownError
    ) {
      return error;
    }

    return new UnknownError({
      message: error instanceof Error ? error.message : undefined,
      cause: error,
    });
  }

  private async makeRequestOptions(
    request: HttpRequest<Client, unknown>,
    options?: HttpRequestOptions,
  ): Promise<HttpRequestOptions> {
    let result = this.mergeRequestOptions(DEFAULT_REQUEST_OPTIONS, this.requestOptions);
    result = await this.interceptorPipeline.intercept(result);
    result = this.mergeRequestOptions(result, request.options);
    result = this.mergeRequestOptions(result, options);
    return result;
  }

  private mergeRequestOptions(base: HttpRequestOptions, override?: HttpRequestOptions): HttpRequestOptions {
    if (!override) return base;

    return {
      credentials: override.credentials ?? base.credentials,
      headers: {
        ...base.headers,
        ...override.headers,
      },
    };
  }
}
