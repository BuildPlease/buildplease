import { describe, expect, it } from 'vitest';

import { InterceptorSet, type RemoteRequestInterceptor } from '@/networking/remote-request-interceptor';

function interceptor(name: string, order: number): RemoteRequestInterceptor {
  const item: RemoteRequestInterceptor = {
    order,
    hash: () => Symbol.for(`test.interceptor.${name}`),
    equals: (other) => other === item,
    intercept: (config) => config,
  };

  return item;
}

describe('InterceptorSet', () => {
  it('keeps interceptors ordered by priority', () => {
    const first = interceptor('first', 10);
    const second = interceptor('second', -10);

    const set = new InterceptorSet().add(first, second);

    expect(set.list()).toEqual([second, first]);
  });

  it('replaces interceptors with the same identity when they are not equal', () => {
    const first = interceptor('auth', 10);
    const replacement = interceptor('auth', 0);

    const set = new InterceptorSet().add(first, replacement);

    expect(set.list()).toEqual([replacement]);
  });
});
