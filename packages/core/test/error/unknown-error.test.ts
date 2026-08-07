import { describe, expect, it } from 'vitest';

import { UnknownError } from '@/error/unknown-error';

describe('UnknownError', () => {
  it('uses native Error prototype identity', () => {
    const error = new UnknownError();
    const unrelated = new Error('Unknown error');
    unrelated.name = 'UnknownError';

    expect(error).toBeInstanceOf(UnknownError);
    expect(error).toBeInstanceOf(Error);
    expect(unrelated).not.toBeInstanceOf(UnknownError);
  });
});
