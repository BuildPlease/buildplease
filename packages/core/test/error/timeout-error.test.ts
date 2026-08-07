import { describe, expect, it } from 'vitest';

import { TimeoutError } from '@/error/timeout-error';

describe('TimeoutError', () => {
  it('uses native Error prototype identity', () => {
    const error = new TimeoutError();
    const unrelated = new Error('Request timeout');
    unrelated.name = 'TimeoutError';

    expect(error).toBeInstanceOf(TimeoutError);
    expect(error).toBeInstanceOf(Error);
    expect(unrelated).not.toBeInstanceOf(TimeoutError);
  });
});
