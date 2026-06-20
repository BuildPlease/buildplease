/**
 * @description Built-in alphabet presets for random string generation.
 */
export type RandomValueAlphabetPreset =
  | 'decimal'
  | 'lowercase'
  | 'uppercase'
  | 'letters'
  | 'alphanumeric'
  | 'hex'
  | 'base64'
  | 'base64url';

/**
 * @description Custom alphabet used for random string generation.
 * @example
 * ```ts
 * const alphabet = { characters: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' };
 * ```
 */
export interface RandomValueCustomAlphabet {
  /**
   * @description Characters that may appear in the generated string.
   */
  characters: string;
}

/**
 * @description Alphabet used for random string generation.
 */
export type RandomValueAlphabet = RandomValueAlphabetPreset | RandomValueCustomAlphabet;

/**
 * @description Options for random integer generation.
 */
export interface GenerateNumberOptions {
  /**
   * @description Inclusive lower bound.
   */
  min: number;

  /**
   * @description Inclusive upper bound.
   */
  max: number;
}

/**
 * @description Options for random string generation.
 */
export interface GenerateStringOptions {
  /**
   * @description Exact output length in characters.
   * @default 8
   */
  length?: number;

  /**
   * @description Alphabet used to generate the string.
   * @default 'alphanumeric'
   */
  alphabet?: RandomValueAlphabet;
}

/**
 * @description Default options for `RandomValueGenerator.generateString`.
 */
export const DEFAULT_GENERATE_STRING_OPTIONS = {
  length: 8,
  alphabet: 'alphanumeric',
} as const satisfies Required<GenerateStringOptions>;
