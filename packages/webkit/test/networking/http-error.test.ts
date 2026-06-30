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
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('not_found');
    expect(error.message).toBe('Not found.');
    expect(error.details).toEqual({
      id: ['missing'],
    });
  });
});
