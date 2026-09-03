import { CanceledError, NetworkError, TimeoutError, UnknownError } from '@buildplease/core';
import {
  type HttpClientOptions,
  type HttpRequest,
  type HttpRequestOptions,
  AsyncQueueImpl,
  defineHttpRequest,
  HttpClient,
  HttpError,
  HttpRequestInterceptorPipeline,
} from '@neutral/networking';
import { describe, expect, it } from 'vitest';

type Client = (value: string) => Promise<string>;

class TestHttpClient extends HttpClient {
  public options?: HttpRequestOptions;
  public failure?: unknown;
  public mappedError?: Error;

  public constructor(options: HttpClientOptions = {}) {
    super(options);
  }

  protected createClient(options: HttpRequestOptions): Client {
    this.options = options;

    return async (value) => {
      if (this.failure !== undefined) throw this.failure;
      return value;
    };
  }

  protected override handleError(error: unknown): Error {
    if (this.mappedError) return this.mappedError;
    return super.handleError(error);
  }
}

const request = defineHttpRequest<Client, string>((client) => client('result'));

describe('HttpClient', () => {
  it('applies request options in global, interceptor, request and caller precedence order', async () => {
    const client = new TestHttpClient({
      requestOptions: {
        credentials: false,
        headers: {
          global: 'global',
          override: 'global',
        },
      },
      interceptorPipeline: new HttpRequestInterceptorPipeline([
        {
          identity: Symbol.for('test.interceptor'),
          intercept: (options) => ({
            ...options,
            headers: {
              ...options.headers,
              interceptor: 'interceptor',
              override: 'interceptor',
            },
          }),
        },
      ]),
    });
    const configuredRequest: HttpRequest<string> = {
      ...request,
      options: {
        headers: {
          request: 'request',
          override: 'request',
        },
      },
    };

    await expect(
      client.execute(configuredRequest, {
        credentials: true,
        headers: {
          caller: 'caller',
          override: 'caller',
        },
      }),
    ).resolves.toBe('result');

    expect(client.options).toEqual({
      credentials: true,
      headers: {
        global: 'global',
        interceptor: 'interceptor',
        request: 'request',
        caller: 'caller',
        override: 'caller',
      },
    });
  });

  it('uses parallel execution by default and accepts a custom queue', async () => {
    const defaultClient = new TestHttpClient();
    const serialClient = new TestHttpClient({ asyncQueue: new AsyncQueueImpl('serial') });

    await expect(defaultClient.execute(request)).resolves.toBe('result');
    await expect(serialClient.execute(request)).resolves.toBe('result');
  });

  it.each([
    new HttpError({ statusCode: 500, code: 'error', message: 'Error' }),
    new NetworkError(),
    new TimeoutError(),
    new CanceledError(),
    new UnknownError(),
  ])('preserves canonical BuildPlease errors by default', async (error) => {
    const client = new TestHttpClient();
    client.failure = error;

    await expect(client.execute(request)).rejects.toBe(error);
  });

  it('converts an unrecognized failure to UnknownError by default', async () => {
    const failure = new Error('raw transport failure');
    const client = new TestHttpClient();
    client.failure = failure;

    const promise = client.execute(request);

    await expect(promise).rejects.toBeInstanceOf(UnknownError);
    await expect(promise).rejects.toMatchObject({
      message: failure.message,
      cause: failure,
    });
  });

  it('allows a transport client to override error handling', async () => {
    const failure = new Error('transport offline');
    const mappedError = new NetworkError({ cause: failure });
    const client = new TestHttpClient();
    client.failure = failure;
    client.mappedError = mappedError;

    await expect(client.execute(request)).rejects.toBe(mappedError);
  });
});
