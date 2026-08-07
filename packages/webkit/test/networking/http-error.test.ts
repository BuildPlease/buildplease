import { describe, expect, it } from 'vitest';

import { HttpError } from '@/networking/http-error';

describe('HttpError', () => {
  it('preserves HTTP error metadata', () => {
    const error = new HttpError({
      statusCode: 404,
      code: 'not_found',
      message: 'Not found.',
      details: {
        id: ['missing'],
      },
    });

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('not_found');
    expect(error.message).toBe('Not found.');
    expect(error.details).toEqual({
      id: ['missing'],
    });
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
