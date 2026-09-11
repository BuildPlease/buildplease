import { FrameworkIdentity } from '@buildplease/identity';

const Identity = Symbol.for(`${FrameworkIdentity.name}.ConversionError`);

export class ConversionError extends Error {
  public readonly code = 'MALFORMED_DATA';
  public readonly field?: string;

  constructor(opts: { message?: string; field?: string; cause?: unknown } = {}) {
    const { message = 'Malformed data', field, cause } = opts;
    super(message);
    Object.defineProperty(this, Identity, {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    this.name = 'ConversionError';
    this.field = field;
    if (cause !== undefined) this.cause = cause;
  }

  public static override [Symbol.hasInstance](value: unknown): boolean {
    if (this !== ConversionError) {
      return Function.prototype[Symbol.hasInstance].call(this, value);
    }

    return typeof value === 'object' && value !== null && Identity in value;
  }
}
