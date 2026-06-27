import { describe, expect, it } from 'vitest';

import { CookieInterceptor } from '@/networking/cookie-interceptor';

describe('CookieInterceptor', () => {
  it('enables credentials on outgoing requests', () => {
    const interceptor = new CookieInterceptor();

    expect(interceptor.intercept({ headers: { accept: 'application/json' } })).toEqual({
      headers: { accept: 'application/json' },
      withCredentials: true,
    });
  });

  it('uses stable identity semantics', () => {
    const first = new CookieInterceptor();
    const second = new CookieInterceptor();

    expect(first.order).toBe(-10);
    expect(first.equals(second)).toBe(true);
    expect(first.equals({})).toBe(false);
    expect(first.hash()).toBe(second.hash());
    expect(typeof first.hash()).toBe('symbol');
  });
});
