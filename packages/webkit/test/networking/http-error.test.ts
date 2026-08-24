import { describe, expect, it } from 'vitest';

import { HttpError } from '@/networking/http-error';

describe('HttpError', () => {
  it('preserves HTTP error metadata', () => {
    const cause = new Error('transport');
    const details = {
      requestId: 'request-123',
      upstream: {
        service: 'gateway',
      },
    };
    const error = new HttpError({
      statusCode: 404,
      code: 'not_found',
      message: 'Not found.',
      details: details,
      cause: cause,
    });

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('not_found');
    expect(error.message).toBe('Not found.');
    expect(error.details).toBe(details);
    expect(error.cause).toBe(cause);
  });

  it('supports status-only HTTP errors', () => {
    const error = new HttpError({
      statusCode: 502,
    });

    expect(error.statusCode).toBe(502);
    expect(error.code).toBeUndefined();
    expect(error.message).toBe('');
    expect(error.details).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it('uses native Error prototype identity', () => {
    const unrelated = new Error('Unauthorized');
    unrelated.name = 'HttpError';

    Object.assign(unrelated, {
      statusCode: 401,
      code: 'unauthorized',
    });

    expect(unrelated).not.toBeInstanceOf(HttpError);
  });
});
