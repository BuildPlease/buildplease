import { FrameworkIdentity } from '@buildplease/identity';

const Identity = Symbol.for(`${FrameworkIdentity.name}.HttpError`);

export interface HttpErrorOptions {
  /** HTTP status code. */
  readonly statusCode: number;

  /**
   * Error code.
   * @default undefined
   * @example "not_found"
   */
  readonly code?: string;

  /**
   * Error message.
   * @default undefined
   * @example "Not found"
   */
  readonly message?: string;

  /**
   * Error details.
   * @default undefined
   */
  readonly details?: unknown;

  /**
   * Original error.
   * @default undefined
   */
  readonly cause?: unknown;
}

export class HttpError extends Error {
  public readonly statusCode: HttpErrorOptions['statusCode'];
  public readonly code?: HttpErrorOptions['code'];
  public readonly details?: HttpErrorOptions['details'];

  public constructor(options: HttpErrorOptions) {
    super(options.message);
    Object.defineProperty(this, Identity, {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });
    this.name = 'HttpError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;

    if (options.cause !== undefined) this.cause = options.cause;
  }

  public static override [Symbol.hasInstance](value: unknown): boolean {
    if (this !== HttpError) {
      return Function.prototype[Symbol.hasInstance].call(this, value);
    }

    return typeof value === 'object' && value !== null && Identity in value;
  }
}
