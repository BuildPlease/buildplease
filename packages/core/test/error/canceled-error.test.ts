import { describe, expect, it } from 'vitest';

import { CanceledError } from '@/error/canceled-error';

describe('CanceledError', () => {
  it('uses native Error prototype identity', () => {
    const error = new CanceledError();
    const unrelated = new Error('Request canceled');
    unrelated.name = 'CanceledError';

    expect(error).toBeInstanceOf(CanceledError);
    expect(error).toBeInstanceOf(Error);
    expect(unrelated).not.toBeInstanceOf(CanceledError);
  });
});
