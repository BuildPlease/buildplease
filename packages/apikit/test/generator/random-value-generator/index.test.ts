import { describe, expect, it } from 'vitest';

import { RANDOM_VALUE_GENERATOR_LIMITS, RandomValueGeneratorImpl } from '@/generator/random-value-generator';

describe('RandomValueGenerator', () => {
  const generator = new RandomValueGeneratorImpl();

  it('returns fixed number when min equals max', () => {
    expect(generator.generateNumber({ min: 7, max: 7 })).toBe(7);
  });

  it('generates a number inside an inclusive range', () => {
    const value = generator.generateNumber({ min: 10, max: 20 });

    expect(value).toBeGreaterThanOrEqual(10);
    expect(value).toBeLessThanOrEqual(20);
  });

  it('rejects invalid numeric ranges', () => {
    expect(() => generator.generateNumber({ min: 2, max: 1 })).toThrow(
      'GenerateNumberOptions.max must be greater than or equal to min',
    );

    expect(() =>
      generator.generateNumber({ min: 0, max: RANDOM_VALUE_GENERATOR_LIMITS.randomIntegerRangeLimit }),
    ).toThrow(`GenerateNumberOptions range must be lower than ${RANDOM_VALUE_GENERATOR_LIMITS.randomIntegerRangeLimit}`);
  });

  it('generates strings using presets and custom alphabets', () => {
    expect(generator.generateString({ length: 12, alphabet: 'decimal' })).toMatch(/^\d{12}$/);
    expect(generator.generateString({ length: 16, alphabet: { characters: 'AB' } })).toMatch(/^[AB]{16}$/);
  });

  it('rejects invalid string options', () => {
    expect(() => generator.generateString({ length: 0 })).toThrow(
      'GenerateStringOptions.length must be greater than 0',
    );

    expect(() => generator.generateString({ alphabet: { characters: 'AA' } })).toThrow(
      'GenerateStringOptions.alphabet must not contain duplicate characters',
    );

    expect(() => generator.generateString({ alphabet: { characters: 'A B' } })).toThrow(
      'GenerateStringOptions.alphabet must contain printable ASCII characters without whitespace',
    );
  });

  it('generates UUID values', () => {
    expect(generator.generateUuidV4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(generator.generateUuidV7()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
