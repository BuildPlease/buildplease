export interface HttpErrorOptions {
  /** HTTP status code returned by the remote system. */
  readonly statusCode: number;

  /** Machine-readable error code for programmatic handling. */
  readonly code: string;

  /** Human-readable error description. */
  readonly message: string;

  /**
   * Structured error details.
   *
   * @default undefined
   */
  readonly details?: Readonly<Record<string, string[]>>;

  /**
   * Original transport error.
   *
   * @default undefined
   */
  readonly cause?: unknown;
}

export class HttpError extends Error {
  public readonly statusCode: HttpErrorOptions['statusCode'];
  public readonly code: HttpErrorOptions['code'];
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
