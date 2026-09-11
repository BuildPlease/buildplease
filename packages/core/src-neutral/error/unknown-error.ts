import { FrameworkIdentity } from '@buildplease/identity';

const Identity = Symbol.for(`${FrameworkIdentity.name}.UnknownError`);

export class UnknownError extends Error {
  public readonly code = 'UNKNOWN';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Unknown error', cause } = opts;
    super(message);
    Object.defineProperty(this, Identity, {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    this.name = 'UnknownError';
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](value: unknown): boolean {
    if (this !== UnknownError) {
      return Function.prototype[Symbol.hasInstance].call(this, value);
    }

    return typeof value === 'object' && value !== null && Identity in value;
  }
}
