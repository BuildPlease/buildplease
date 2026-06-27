import { describe, expect, it } from 'vitest';

import { isError } from '@/utils/application/error-utils';

describe('error utils', () => {
  it('detects Error instances', () => {
    expect(isError(new Error('Boom'))).toBe(true);
    expect(isError({ message: 'Boom' })).toBe(false);
  });
});
