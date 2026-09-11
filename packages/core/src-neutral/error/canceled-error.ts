import { FrameworkIdentity } from '@buildplease/identity';

const Identity = Symbol.for(`${FrameworkIdentity.name}.CanceledError`);

export class CanceledError extends Error {
  public readonly code = 'CANCELED';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Request canceled', cause } = opts;
    super(message);
    Object.defineProperty(this, Identity, {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    this.name = 'CanceledError';
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](value: unknown): boolean {
    if (this !== CanceledError) {
      return Function.prototype[Symbol.hasInstance].call(this, value);
    }

    return typeof value === 'object' && value !== null && Identity in value;
  }
}
