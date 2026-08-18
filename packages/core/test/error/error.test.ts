import { describe, expect, it } from 'vitest';

import { CanceledError } from '@/error/canceled-error';
import { ConversionError } from '@/error/conversion-error';
import { NetworkError } from '@/error/network-error';
import { TimeoutError } from '@/error/timeout-error';
import { UnknownError } from '@/error/unknown-error';

describe('framework errors', () => {
  it.each([
    ['CanceledError', () => new CanceledError(), CanceledError],
    ['ConversionError', () => new ConversionError(), ConversionError],
    ['NetworkError', () => new NetworkError(), NetworkError],
    ['TimeoutError', () => new TimeoutError(), TimeoutError],
    ['UnknownError', () => new UnknownError(), UnknownError],
  ] as const)('%s uses native Error prototype identity', (_name, createError, ErrorType) => {
    const error = createError();
    const unrelated = new Error(error.message);
    unrelated.name = error.name;

    expect(error).toBeInstanceOf(ErrorType);
    expect(error).toBeInstanceOf(Error);
    expect(unrelated).not.toBeInstanceOf(ErrorType);
  });
});
