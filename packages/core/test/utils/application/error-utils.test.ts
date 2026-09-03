import { isError } from '@neutral/utils/application/error-utils';
import { describe, expect, it } from 'vitest';

describe('error utils', () => {
  it('detects Error instances', () => {
    expect(isError(new Error('Boom'))).toBe(true);
    expect(isError({ message: 'Boom' })).toBe(false);
  });
});
