import { FrameworkIdentity } from '@buildplease/identity';

const Identity = Symbol.for(`${FrameworkIdentity.name}.NetworkError`);

export class NetworkError extends Error {
  public readonly code = 'NETWORK_ERROR';

  constructor(opts: { message?: string; cause?: unknown } = {}) {
    const { message = 'Network error', cause } = opts;
    super(message);
    Object.defineProperty(this, Identity, {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    this.name = 'NetworkError';
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](value: unknown): boolean {
    if (this !== NetworkError) {
      return Function.prototype[Symbol.hasInstance].call(this, value);
    }

    return typeof value === 'object' && value !== null && Identity in value;
  }
}
