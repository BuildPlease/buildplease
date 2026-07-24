import { describe, expect, it } from 'vitest';

import { Cookie } from '@/http/cookie';

describe('Cookie', () => {
  it('serializes a cookie with HTTP options', () => {
    const cookie = new Cookie('session', 'token', {
      domain: '.myssless.com',
      expires: new Date('2030-01-01T00:00:00.000Z'),
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });

    const serialized = cookie.serialize();

    expect(serialized).toContain('session=token');
    expect(serialized).toContain('Domain=.myssless.com');
    expect(serialized).toContain('Expires=Tue, 01 Jan 2030 00:00:00 GMT');
    expect(serialized).toContain('HttpOnly');
    expect(serialized).toContain('Path=/');
    expect(serialized).toContain('SameSite=Lax');
    expect(serialized).toContain('Secure');
  });

  it('mutates only provided values and preserves existing options', () => {
    const cookie = new Cookie('session', 'token', {
      httpOnly: true,
      path: '/',
      secure: false,
    });

    const result = cookie.mutate({
      value: 'updated-token',
      options: {
        secure: true,
      },
    });

    expect(result).toBe(cookie);
    expect(cookie.name).toBe('session');
    expect(cookie.value).toBe('updated-token');
    expect(cookie.options).toEqual({
      httpOnly: true,
      path: '/',
      secure: true,
    });
  });

  it('supports mutating the cookie name', () => {
    const cookie = new Cookie('session', 'token');

    cookie.mutate({ name: 'account-session' });

    expect(cookie.name).toBe('account-session');
    expect(cookie.serialize()).toBe('account-session=token');
  });

  it('serializes through toString', () => {
    const cookie = new Cookie('language', 'en');

    expect(cookie.toString()).toBe(cookie.serialize());
  });
});
