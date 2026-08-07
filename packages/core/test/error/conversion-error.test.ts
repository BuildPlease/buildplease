import { describe, expect, it } from 'vitest';

import { ConversionError } from '@/error/conversion-error';

describe('ConversionError', () => {
  it('uses native Error prototype identity', () => {
    const error = new ConversionError();
    const unrelated = new Error('Malformed data');
    unrelated.name = 'ConversionError';

    expect(error).toBeInstanceOf(ConversionError);
    expect(error).toBeInstanceOf(Error);
    expect(unrelated).not.toBeInstanceOf(ConversionError);
  });
});
