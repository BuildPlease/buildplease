import { CanceledError } from '@neutral/error/canceled-error';
import { ConversionError } from '@neutral/error/conversion-error';
import { NetworkError } from '@neutral/error/network-error';
import { TimeoutError } from '@neutral/error/timeout-error';
import { UnknownError } from '@neutral/error/unknown-error';
import { describe, expect, it } from 'vitest';

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
