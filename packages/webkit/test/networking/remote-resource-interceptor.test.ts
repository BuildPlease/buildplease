import { CanceledError } from '@buildplease/core';
import {
  type HttpClientOptions,
  type HttpErrorInterceptor,
  type HttpErrorResolution,
  type HttpRequest,
  type HttpRequestOptions,
  type RemoteEndpoint,
  HttpClient,
  HttpError,
  PublicRemoteResource,
  SecuredRemoteResource,
} from '@neutral/networking';
import { describe, expect, it, vi } from 'vitest';

function deferred<T = void>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise: promise,
    resolve: (value: T) => resolvePromise?.(value),
  };
}

type Client = () => Promise<string>;

class TestHttpClient extends HttpClient {
  public constructor(options: HttpClientOptions = {}) {
    super(options);
  }

  protected createClient(_options: HttpRequestOptions): Client {
    return async () => 'unused';
  }
}

class TestEndpoint implements RemoteEndpoint<() => Promise<string>, () => Promise<string>, string, string> {
  public async convertInput(input: () => Promise<string>): Promise<() => Promise<string>> {
    return input;
  }

  public makeRequest(operation: () => Promise<string>): HttpRequest<string> {
    return {
      execute: async () => await operation(),
    };
  }

  public async convertOutput(output: string): Promise<string> {
    return output;
  }
}

class TestPublicResource extends PublicRemoteResource<() => Promise<string>, string> {}
class TestSecuredResource extends SecuredRemoteResource<() => Promise<string>, string> {}

class TestErrorInterceptor implements HttpErrorInterceptor {
  public constructor(
    private readonly resolver: (error: HttpError) => HttpErrorResolution | undefined,
    private readonly handler: (error: HttpError) => void | Promise<void>,
  ) {}

  public resolve(error: HttpError): HttpErrorResolution | undefined {
    return this.resolver(error);
  }

  public handle(error: HttpError): void | Promise<void> {
    return this.handler(error);
  }
}

function httpError(statusCode: number, code = 'error'): HttpError {
  return new HttpError({ statusCode: statusCode, code: code, message: 'HTTP error' });
}

describe('PublicRemoteResource and SecuredRemoteResource', () => {
  it('does not invoke the error interceptor for public requests', async () => {
    const handle = vi.fn(async () => undefined);
    const client = new TestHttpClient({
      errorInterceptor: new TestErrorInterceptor(() => 'interrupt', handle),
    });
    const resource = new TestPublicResource(new TestEndpoint(), client);
    const error = httpError(401, 'unauthorized');

    await expect(resource.execute(async () => Promise.reject(error))).rejects.toBe(error);
    expect(handle).not.toHaveBeenCalled();
  });

  it('leaves unresolved secured errors unchanged', async () => {
    const handle = vi.fn(async () => undefined);
    const client = new TestHttpClient({
      errorInterceptor: new TestErrorInterceptor(() => undefined, handle),
    });
    const resource = new TestSecuredResource(new TestEndpoint(), client);
    const error = httpError(401, 'unauthorized');

    await expect(resource.execute(async () => Promise.reject(error))).rejects.toBe(error);
    expect(handle).not.toHaveBeenCalled();
  });

  it('handles the current secured error without interrupting the client queue', async () => {
    const handle = vi.fn(async () => undefined);
    const client = new TestHttpClient({
      errorInterceptor: new TestErrorInterceptor(() => 'handle', handle),
    });
    const endpoint = new TestEndpoint();
    const securedResource = new TestSecuredResource(endpoint, client);
    const publicResource = new TestPublicResource(endpoint, client);
    const publicGate = deferred<void>();
    const error = httpError(403, 'forbidden');

    const publicPromise = publicResource.execute(async () => {
      await publicGate.promise;
      return 'public';
    });

    await expect(securedResource.execute(async () => Promise.reject(error))).rejects.toMatchObject({ cause: error });
    expect(handle).toHaveBeenCalledOnce();

    publicGate.resolve(undefined);
    await expect(publicPromise).resolves.toBe('public');
  });

  it('interrupts the client queue and handles a concurrent error once', async () => {
    const handlerGate = deferred<void>();
    const handlerStarted = deferred<void>();
    const handle = vi.fn(async () => {
      handlerStarted.resolve(undefined);
      await handlerGate.promise;
    });
    const client = new TestHttpClient({
      errorInterceptor: new TestErrorInterceptor(() => 'interrupt', handle),
    });
    const endpoint = new TestEndpoint();
    const first = new TestSecuredResource(endpoint, client);
    const second = new TestSecuredResource(endpoint, client);
    const firstError = httpError(401, 'first');
    const secondError = httpError(401, 'second');

    const firstPromise = first.execute(async () => Promise.reject(firstError));
    const secondPromise = second.execute(async () => Promise.reject(secondError));
    const firstResult = firstPromise.catch((error: unknown) => error);
    const secondResult = secondPromise.catch((error: unknown) => error);

    await handlerStarted.promise;
    expect(handle).toHaveBeenCalledOnce();

    handlerGate.resolve(undefined);

    await expect(firstResult).resolves.toMatchObject({ cause: firstError });
    await expect(secondResult).resolves.toBeInstanceOf(CanceledError);
    expect(handle).toHaveBeenCalledOnce();
  });

  it('cancels unresolved public requests sharing the same client when interrupted', async () => {
    const publicGate = deferred<void>();
    const handle = vi.fn(async () => undefined);
    const client = new TestHttpClient({
      errorInterceptor: new TestErrorInterceptor(() => 'interrupt', handle),
    });
    const endpoint = new TestEndpoint();
    const publicResource = new TestPublicResource(endpoint, client);
    const securedResource = new TestSecuredResource(endpoint, client);

    const publicPromise = publicResource.execute(async () => {
      await publicGate.promise;
      return 'public';
    });
    const publicResult = publicPromise.catch((error: unknown) => error);

    await Promise.resolve();
    const error = httpError(401, 'unauthorized');
    const securedPromise = securedResource.execute(async () => Promise.reject(error));

    await expect(securedPromise).rejects.toMatchObject({ cause: error });
    await expect(publicResult).resolves.toBeInstanceOf(CanceledError);
    expect(handle).toHaveBeenCalledOnce();

    publicGate.resolve(undefined);
  });
});
