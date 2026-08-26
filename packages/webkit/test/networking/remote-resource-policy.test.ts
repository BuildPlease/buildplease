import { CanceledError } from '@buildplease/core';
import { describe, expect, it, vi } from 'vitest';

import {
  type HttpClientOptions,
  type HttpRequest,
  type HttpRequestOptions,
  type RemoteEndpoint,
  HttpClient,
  HttpError,
  PublicRemoteResource,
  SecuredRemoteResource,
} from '@/networking';

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

function httpError(statusCode: number, code = 'error'): HttpError {
  return new HttpError({ statusCode: statusCode, code: code, message: 'HTTP error' });
}

describe('PublicRemoteResource and SecuredRemoteResource', () => {
  it('does not invoke unauthorized handling for public requests', async () => {
    const handler = vi.fn(async () => undefined);
    const client = new TestHttpClient({
      unauthorized: {
        statusCodes: [401],
        cancelAll: true,
        handler: { handle: handler },
      },
    });
    const resource = new TestPublicResource(new TestEndpoint(), client);
    const error = httpError(401, 'unauthorized');

    await expect(resource.execute(async () => Promise.reject(error))).rejects.toBe(error);
    expect(handler).not.toHaveBeenCalled();
  });

  it('leaves secured errors unchanged when unauthorized handling is not configured', async () => {
    const client = new TestHttpClient();
    const resource = new TestSecuredResource(new TestEndpoint(), client);
    const error = httpError(401, 'unauthorized');

    await expect(resource.execute(async () => Promise.reject(error))).rejects.toBe(error);
  });

  it('handles unauthorized errors without canceling the queue when cancelAll is false', async () => {
    const handler = vi.fn(async () => undefined);
    const client = new TestHttpClient({
      unauthorized: {
        statusCodes: [401],
        cancelAll: false,
        handler: { handle: handler },
      },
    });
    const endpoint = new TestEndpoint();
    const securedResource = new TestSecuredResource(endpoint, client);
    const publicResource = new TestPublicResource(endpoint, client);
    const publicGate = deferred<void>();
    const error = httpError(401, 'unauthorized');

    const publicPromise = publicResource.execute(async () => {
      await publicGate.promise;
      return 'public';
    });

    await expect(securedResource.execute(async () => Promise.reject(error))).rejects.toBe(error);
    expect(handler).toHaveBeenCalledOnce();

    publicGate.resolve(undefined);
    await expect(publicPromise).resolves.toBe('public');
  });

  it('interrupts the client queue and invokes the handler once for concurrent unauthorized requests', async () => {
    const handlerGate = deferred<void>();
    const handlerStarted = deferred<void>();
    const handler = vi.fn(async () => {
      handlerStarted.resolve(undefined);
      await handlerGate.promise;
    });
    const client = new TestHttpClient({
      unauthorized: {
        statusCodes: [401],
        cancelAll: true,
        handler: { handle: handler },
      },
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
    expect(handler).toHaveBeenCalledOnce();

    handlerGate.resolve(undefined);

    await expect(firstResult).resolves.toMatchObject({ cause: firstError });
    await expect(secondResult).resolves.toBeInstanceOf(CanceledError);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('cancels unresolved public requests sharing the same client when unauthorized handling interrupts the queue', async () => {
    const publicGate = deferred<void>();
    const handler = vi.fn(async () => undefined);
    const client = new TestHttpClient({
      unauthorized: {
        statusCodes: [401],
        cancelAll: true,
        handler: { handle: handler },
      },
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
    expect(handler).toHaveBeenCalledOnce();

    publicGate.resolve(undefined);
  });

  it('uses the explicitly configured unauthorized status codes', async () => {
    const handler = vi.fn(async () => undefined);
    const client = new TestHttpClient({
      unauthorized: {
        statusCodes: [427],
        cancelAll: true,
        handler: { handle: handler },
      },
    });
    const resource = new TestSecuredResource(new TestEndpoint(), client);
    const regularError = httpError(401, 'regular');
    const unauthorizedError = httpError(427, 'unauthorized');

    await expect(resource.execute(async () => Promise.reject(regularError))).rejects.toBe(regularError);
    expect(handler).not.toHaveBeenCalled();

    await expect(resource.execute(async () => Promise.reject(unauthorizedError))).rejects.toMatchObject({
      cause: unauthorizedError,
    });
    expect(handler).toHaveBeenCalledOnce();
  });
});
