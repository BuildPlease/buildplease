import { randomInt } from 'node:crypto';

import { injectable } from 'inversify';
import { v4 as uuidV4, v7 as uuidV7 } from 'uuid';

import {
  type GenerateNumberOptions,
  type GenerateStringOptions,
  type RandomValueAlphabet,
  type RandomValueAlphabetPreset,
} from './random-value-generator-options';

/**
 * @description Generator limits used by `RandomValueGeneratorImpl`.
 */
export const RANDOM_VALUE_GENERATOR_LIMITS = {
  maxStringLength: 4096,
  randomIntegerRangeLimit: 2 ** 48,
} as const;

/**
 * @description Default options for `RandomValueGenerator.generateString`.
 */
export const DEFAULT_GENERATE_STRING_OPTIONS = {
  length: 8,
  alphabet: 'alphanumeric',
} as const satisfies Required<GenerateStringOptions>;

const ALPHABETS: Record<RandomValueAlphabetPreset, string> = {
  decimal: '0123456789',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphanumeric: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  hex: '0123456789abcdef',
  base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
};

/**
 * @description Crypto-safe random primitive value generator.
 */
export interface RandomValueGenerator {
  /**
   * @description Generates a random integer inside an inclusive range.
   * @example
   * ```ts
   * generator.generateNumber({ min: 1000, max: 9999 });
   * ```
   * @throws Error when `min`, `max`, or the requested range is invalid.
   */
  generateNumber(options: GenerateNumberOptions): number;

  /**
   * @description Generates a random string from an alphabet.
   * @default DEFAULT_GENERATE_STRING_OPTIONS
   * @example
   * ```ts
   * generator.generateString({ length: 6, alphabet: 'decimal' });
   * ```
   * @example
   * ```ts
   * generator.generateString({ length: 64, alphabet: 'base64url' });
   * ```
   * @throws Error when `length` or `alphabet` is invalid.
   */
  generateString(options?: GenerateStringOptions): string;

  /**
   * @description Generates a random UUID v4 string.
   * @example
   * ```ts
   * generator.generateUuidV4();
   * ```
   */
  generateUuidV4(): string;

  /**
   * @description Generates a time-ordered UUID v7 string.
   * @example
   * ```ts
   * generator.generateUuidV7();
   * ```
   */
  generateUuidV7(): string;
}

@injectable()
export class RandomValueGeneratorImpl implements RandomValueGenerator {
  // MARK: - Public

  public generateNumber(options: GenerateNumberOptions): number {
    this.assertGenerateNumberOptions(options);

    if (options.min === options.max) {
      return options.min;
    }

    return randomInt(options.min, options.max + 1);
  }

  public generateString(options: GenerateStringOptions = DEFAULT_GENERATE_STRING_OPTIONS): string {
    const length = options.length ?? DEFAULT_GENERATE_STRING_OPTIONS.length;
    const alphabet = this.resolveAlphabet(options.alphabet ?? DEFAULT_GENERATE_STRING_OPTIONS.alphabet);

    this.assertStringLength(length);
    this.assertAlphabet(alphabet);

    let result = '';

    for (let index = 0; index < length; index++) {
      result += alphabet.charAt(randomInt(0, alphabet.length));
    }

    return result;
  }

  public generateUuidV4(): string {
    return uuidV4();
  }

  public generateUuidV7(): string {
    return uuidV7();
  }

  // MARK: - Private

  private resolveAlphabet(alphabet: RandomValueAlphabet): string {
    if (typeof alphabet === 'string') {
      return ALPHABETS[alphabet];
    }

    return alphabet.characters;
  }

  private assertGenerateNumberOptions(options: GenerateNumberOptions): void {
    if (!Number.isSafeInteger(options.min)) {
      throw new Error('GenerateNumberOptions.min must be a safe integer');
    }

    if (!Number.isSafeInteger(options.max)) {
      throw new Error('GenerateNumberOptions.max must be a safe integer');
    }

    if (options.max < options.min) {
      throw new Error('GenerateNumberOptions.max must be greater than or equal to min');
    }

    if (options.max === Number.MAX_SAFE_INTEGER) {
      throw new Error('GenerateNumberOptions.max must be lower than Number.MAX_SAFE_INTEGER');
    }

    if (options.max - options.min >= RANDOM_VALUE_GENERATOR_LIMITS.randomIntegerRangeLimit) {
      throw new Error(
        `GenerateNumberOptions range must be lower than ${RANDOM_VALUE_GENERATOR_LIMITS.randomIntegerRangeLimit}`,
      );
    }
  }

  private assertStringLength(length: number): void {
    if (!Number.isSafeInteger(length)) {
      throw new Error('GenerateStringOptions.length must be a safe integer');
    }

    if (length <= 0) {
      throw new Error('GenerateStringOptions.length must be greater than 0');
    }

    if (length > RANDOM_VALUE_GENERATOR_LIMITS.maxStringLength) {
      throw new Error(
        `GenerateStringOptions.length must be lower than or equal to ${RANDOM_VALUE_GENERATOR_LIMITS.maxStringLength}`,
      );
    }
  }

  private assertAlphabet(alphabet: string): void {
    if (alphabet.length < 2) {
      throw new Error('GenerateStringOptions.alphabet must contain at least 2 characters');
    }

    if (!/^[!-~]+$/.test(alphabet)) {
      throw new Error('GenerateStringOptions.alphabet must contain printable ASCII characters without whitespace');
    }

    if (new Set(alphabet).size !== alphabet.length) {
      throw new Error('GenerateStringOptions.alphabet must not contain duplicate characters');
    }
  }
}
