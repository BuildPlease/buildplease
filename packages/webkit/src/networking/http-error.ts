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
    this.name = 'HttpError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;

    if (options.cause !== undefined) this.cause = options.cause;
  }
}
