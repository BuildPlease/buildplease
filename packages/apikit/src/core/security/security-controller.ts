import crypto from 'crypto';

import { injectable } from 'inversify';

export interface SecurityController {
  generateRandomCode(length?: number): number;
  generateRandomString(length?: number): string;
  generateRandom32Key(): string;
  generateRandom64Key(): string;
}

@injectable()
export class SecurityControllerImpl implements SecurityController {
  generateRandomCode(length: number = 6): number {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  generateRandomString(length: number = 8): string {
    const characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  generateRandom32Key(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generateRandom64Key(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}
