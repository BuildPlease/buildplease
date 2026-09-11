import { FrameworkIdentity } from '@buildplease/identity';

const Identity = Symbol.for(`${FrameworkIdentity.name}.TimeoutError`);

export class TimeoutError extends Error {
  public readonly code = 'TIMEOUT';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Request timeout', cause } = opts;
    super(message);
    Object.defineProperty(this, Identity, {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    this.name = 'TimeoutError';
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](value: unknown): boolean {
    if (this !== TimeoutError) {
      return Function.prototype[Symbol.hasInstance].call(this, value);
    }

    return typeof value === 'object' && value !== null && Identity in value;
  }
}
