import type { Identity } from '@buildplease/core';
import {
  type HttpRequestInterceptor,
  type HttpRequestOptions,
  HttpRequestInterceptorPipeline,
} from '@neutral/networking';
import { describe, expect, it, vi } from 'vitest';

class TestInterceptor implements HttpRequestInterceptor {
  public constructor(
    public readonly identity: Identity,
    private readonly header: string,
  ) {}

  public intercept(options: HttpRequestOptions): HttpRequestOptions {
    return {
      ...options,
      headers: {
        ...options.headers,
        [this.header]: this.header,
      },
    };
  }
}

describe('HttpRequestInterceptorPipeline', () => {
  it('applies interceptors in registration order', async () => {
    const pipeline = new HttpRequestInterceptorPipeline([
      new TestInterceptor(Symbol.for('test.first'), 'first'),
      new TestInterceptor(Symbol.for('test.second'), 'second'),
    ]);

    await expect(pipeline.intercept({ credentials: true, headers: {} })).resolves.toEqual({
      credentials: true,
      headers: {
        first: 'first',
        second: 'second',
      },
    });
  });

  it('ignores duplicate identities and reports a warning', async () => {
    const warning = vi.fn();
    const identity = Symbol.for('test.duplicate');
    const pipeline = new HttpRequestInterceptorPipeline(
      [new TestInterceptor(identity, 'first'), new TestInterceptor(identity, 'duplicate')],
      warning,
    );

    const result = await pipeline.intercept({ credentials: true, headers: {} });

    expect(result.headers).toEqual({ first: 'first' });
    expect(warning).toHaveBeenCalledOnce();
  });
});
