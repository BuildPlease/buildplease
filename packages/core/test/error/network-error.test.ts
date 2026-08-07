import { describe, expect, it } from 'vitest';

import { NetworkError } from '@/error/network-error';

describe('NetworkError', () => {
  it('uses native Error prototype identity', () => {
    const error = new NetworkError();
    const unrelated = new Error('Network error');
    unrelated.name = 'NetworkError';

    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toBeInstanceOf(Error);
    expect(unrelated).not.toBeInstanceOf(NetworkError);
  });
});
