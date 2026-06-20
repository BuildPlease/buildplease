import { createHash, createHmac, timingSafeEqual as nodeTimingSafeEqual } from 'node:crypto';

import * as argon2 from 'argon2';
import { injectable } from 'inversify';

import {
  type CryptographyOutputEncoding,
  type DigestAlgorithm,
  type DigestOptions,
  type MacAlgorithm,
  type MacOptions,
  type PasswordHashOptions,
} from './cryptography-options';

/**
 * @description Generic cryptography primitives for Node runtime code.
 */
export interface CryptographyController {
  /**
   * @description Generates a digest for a UTF-8 string value.
   */
  digest(value: string, options: DigestOptions): string;

  /**
   * @description Generates a message authentication code for a UTF-8 string value.
   */
  mac(value: string, options: MacOptions): string;

  /**
   * @description Verifies a message authentication code in constant time when lengths match.
   */
  verifyMac(value: string, expected: string, options: MacOptions): boolean;

  /**
   * @description Hashes a password using the selected password hashing algorithm.
   */
  hashPassword(password: string, options: PasswordHashOptions): Promise<string>;

  /**
   * @description Verifies a password against an encoded password hash.
   */
  verifyPassword(password: string, hash: string): Promise<boolean>;

  /**
   * @description Compares two strings in constant time when lengths match.
   */
  timingSafeEqual(left: string, right: string): boolean;
}

@injectable()
export class CryptographyControllerImpl implements CryptographyController {
  // MARK: - Public

  public digest(value: string, options: DigestOptions): string {
    const digest = createHash(this.resolveDigestAlgorithm(options.algorithm)).update(value, 'utf8').digest();

    return this.encode(digest, options.outputEncoding);
  }

  public mac(value: string, options: MacOptions): string {
    const mac = createHmac(this.resolveMacAlgorithm(options.algorithm), options.secret).update(value, 'utf8').digest();

    return this.encode(mac, options.outputEncoding);
  }

  public verifyMac(value: string, expected: string, options: MacOptions): boolean {
    const actual = this.mac(value, options);

    return this.timingSafeEqual(actual, expected);
  }

  public async hashPassword(password: string, options: PasswordHashOptions): Promise<string> {
    switch (options.algorithm) {
      case 'argon2id':
        return argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: options.memoryCost,
          timeCost: options.timeCost,
          parallelism: options.parallelism,
        });
    }
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  public timingSafeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return nodeTimingSafeEqual(leftBuffer, rightBuffer);
  }

  // MARK: - Private

  private encode(value: Buffer, encoding: CryptographyOutputEncoding): string {
    switch (encoding) {
      case 'hex':
        return value.toString('hex');
      case 'base64url':
        return value.toString('base64url');
    }
  }

  private resolveDigestAlgorithm(algorithm: DigestAlgorithm): string {
    switch (algorithm) {
      case 'sha256':
        return 'sha256';
      case 'sha384':
        return 'sha384';
      case 'sha512':
        return 'sha512';
    }
  }

  private resolveMacAlgorithm(algorithm: MacAlgorithm): string {
    switch (algorithm) {
      case 'hmac-sha256':
        return 'sha256';
      case 'hmac-sha384':
        return 'sha384';
      case 'hmac-sha512':
        return 'sha512';
    }
  }
}
