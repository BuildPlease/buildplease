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
   * Optional structured details for debugging.
   * Each key maps to an array of error messages for that field.
   *
   * @example
   * {
   *   "email": ["must be a valid email address"],
   *   "password": ["required", "must be at least 8 characters"]
   * }
   */
  details?: Record<string, string[]>;
}

/**
 * A specialized `Error` carrying an HTTP status code, machine‐readable code,
 * human‐readable message, and optional debug details.
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
 * // With structured debug details
 * throw new HttpError({
 *   statusCode: 422,
 *   code: "VALIDATION_ERROR",
 *   message: "One or more fields are invalid",
 *   details: {
 *     "email": ["must be a valid email address"],
 *     "password": ["required", "must be at least 8 characters"]
 *   }
 * });
 */
export class HttpError extends Error {
  public readonly statusCode: HttpErrorOptions['statusCode'];
  public readonly code: HttpErrorOptions['code'];
  public readonly details?: HttpErrorOptions['details'];

  constructor(options: HttpErrorOptions) {
    super(options.message);
    this.name = 'HttpError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}
