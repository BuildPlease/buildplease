/**
 * @description Supported output encodings for cryptographic digest and MAC values.
 */
export type CryptographyOutputEncoding = 'hex' | 'base64url';

/**
 * @description Supported digest algorithms.
 */
export type DigestAlgorithm = 'sha256' | 'sha384' | 'sha512';

/**
 * @description Options for cryptographic digest generation.
 */
export interface DigestOptions {
  /**
   * @description Digest algorithm.
   */
  algorithm: DigestAlgorithm;

  /**
   * @description Encoded output format.
   */
  outputEncoding: CryptographyOutputEncoding;
}

/**
 * @description Supported message authentication code algorithms.
 */
export type MacAlgorithm = 'hmac-sha256' | 'hmac-sha384' | 'hmac-sha512';

/**
 * @description Options for message authentication code generation and verification.
 */
export interface MacOptions {
  /**
   * @description Message authentication code algorithm.
   */
  algorithm: MacAlgorithm;

  /**
   * @description Secret key used by the MAC algorithm.
   */
  secret: string;

  /**
   * @description Encoded output format.
   */
  outputEncoding: CryptographyOutputEncoding;
}

/**
 * @description Supported password hash algorithms.
 */
export type PasswordHashAlgorithm = 'argon2id';

/**
 * @description Options for password hashing.
 */
export interface PasswordHashOptions {
  /**
   * @description Password hash algorithm.
   */
  algorithm: PasswordHashAlgorithm;

  /**
   * @description Argon2 memory cost in KiB.
   */
  memoryCost: number;

  /**
   * @description Argon2 iteration count.
   */
  timeCost: number;

  /**
   * @description Argon2 parallelism factor.
   */
  parallelism: number;
}
