export interface HttpErrorOptions {
  /**
   * HTTP status code for the error response.
   * @example 404 // Not Found
   * @example 500 // Internal Server Error
   */
  statusCode: number;

  /**
   * Machine‐readable error code for programmatic handling.
   * @example "UNAUTHORIZED"
   * @example "RESOURCE_NOT_FOUND"
   */
  code: string;

  /**
   * Human‐readable error description (localized or raw).
   * @example "Authentication required"
   * @example "User profile not found"
   */
  message: string;

  /**
   * Optional technical details for debugging.
   * @example "Failed to verify JWT token"
   * @example "User ID: 123 | Path: /api/v1/users"
   */
  details?: string | null;
}

/**
 * A specialized `Error` carrying an HTTP status code, machine‐readable code,
 * human‐readable message, and optional debug details.
 *
 * Can be used interchangeably with `instanceof HttpError` even across module
 * boundaries, thanks to the custom `Symbol.hasInstance` override.
 *
 * @example
 * // Basic usage
 * throw new HttpError({
 *   statusCode: 404,
 *   code: "NOT_FOUND",
 *   message: "Resource not found"
 * });
 *
 * @example
 * // With debug details
 * throw new HttpError({
 *   statusCode: 403,
 *   code: "FORBIDDEN",
 *   message: "Insufficient permissions",
 *   details: "User tried accessing /admin"
 * });
 */
export class HttpError extends Error {
  /**
   * The HTTP status code from the error response.
   * @example 401
   */
  public readonly statusCode: number;

  /**
   * A short, machine‐readable code identifying the error type.
   * @example "VALIDATION_ERROR"
   */
  public readonly code: string;

  /**
   * Optional technical details for debugging.
   * @example "Invalid email format: 'user@example'"
   */
  public readonly details?: string | null;

  /**
   * Constructs a new `HttpError`.
   * @param opts - Configuration options for the error.
   */
  constructor(opts: HttpErrorOptions) {
    super(opts.message);
    this.name = 'HttpError';
    this.statusCode = opts.statusCode;
    this.code = opts.code;
    this.details = opts.details;
  }

  /**
   * Customizes the behavior of `instanceof` so that even if consuming app
   * ends up with multiple copies of this class (e.g. from different bundles),
   * it can still reliably detect an `HttpError` by duck‐typing:
   *
   * - Must be an `Error`
   * - `name` must be `"HttpError"`
   * - Has a numeric `statusCode`
   * - Has a string `code`
   *
   * @param value - The object to test.
   * @returns `true` if `value` quacks like an `HttpError`.
   */
  public static override [Symbol.hasInstance](value: unknown): boolean {
    return (
      value instanceof Error &&
      (value as any).name === HttpError.name &&
      typeof (value as any).statusCode === 'number' &&
      typeof (value as any).code === 'string'
    );
  }
}
