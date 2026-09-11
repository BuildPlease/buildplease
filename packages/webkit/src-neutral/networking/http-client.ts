import { CanceledError, NetworkError, TimeoutError, UnknownError } from '@buildplease/core';

import { type AsyncQueue, AsyncQueueImpl } from './async-queue';
import { HttpError } from './http-error';
import type { HttpErrorInterceptor } from './http-error-interceptor';
import type { HttpRequest } from './http-request';
import type { HttpRequestInterceptor } from './http-request-interceptor';
import { HttpRequestInterceptorPipeline } from './http-request-interceptor-pipeline';
import type { HttpRequestOptions } from './http-request-options';

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
   * Interceptors applied to every request in registration order.
   *
   * @default []
   */
  readonly requestInterceptors?: readonly HttpRequestInterceptor[];

  /** Optional interceptor applied to errors produced by secured HTTP resources. */
  readonly errorInterceptor?: HttpErrorInterceptor;

  /**
   * Queue used to execute requests.
   *
   * @default `AsyncQueueImpl` in `parallel` mode
   */
  readonly asyncQueue?: AsyncQueue;
}

export abstract class HttpClient {
  private readonly requestOptions: HttpRequestOptions;
  private readonly requestInterceptorPipeline: HttpRequestInterceptorPipeline;
  private readonly errorInterceptor?: HttpErrorInterceptor;
  public readonly asyncQueue: AsyncQueue;

  public constructor(options: HttpClientOptions = {}) {
    this.requestOptions = options.requestOptions ?? {};
    this.requestInterceptorPipeline = new HttpRequestInterceptorPipeline(options.requestInterceptors);
    this.errorInterceptor = options.errorInterceptor;
    this.asyncQueue = options.asyncQueue ?? new AsyncQueueImpl();
  }

  public execute<Output>(request: HttpRequest<Output>, options?: HttpRequestOptions): Promise<Output> {
    return this.asyncQueue.execute(async () => {
      const requestOptions = await this.makeRequestOptions(request, options);

      try {
        const client = this.createClient(requestOptions);
        return await request.execute(client);
      } catch (error) {
        throw this.normalizeError(error);
      }
    });
  }

  public async handleError(error: HttpError): Promise<never> {
    const interceptor = this.errorInterceptor;
    const resolution = interceptor?.resolve(error);
    if (!interceptor || !resolution) throw error;

    const handle = async (): Promise<void> => {
      await interceptor.handle(error);
    };

    if (resolution === 'interrupt') {
      await this.asyncQueue.interrupt(handle);
    } else {
      await handle();
    }

    throw new CanceledError({ cause: error });
  }

  protected abstract createClient(options: HttpRequestOptions): unknown;

  protected normalizeError(error: unknown): Error {
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
    request: HttpRequest<unknown>,
    options?: HttpRequestOptions,
  ): Promise<HttpRequestOptions> {
    let result = this.mergeRequestOptions(DEFAULT_REQUEST_OPTIONS, this.requestOptions);
    result = await this.requestInterceptorPipeline.intercept(result);
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
