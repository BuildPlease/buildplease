export interface HttpErrorOptions {
  /**
   * HTTP status code for the error response
   * @example 404 // Not Found
   * @example 500 // Internal Server Error
   */
  statusCode: number;

  /**
   * Machine-readable error code for programmatic handling
   * @example "UNAUTHORIZED"
   * @example "RESOURCE_NOT_FOUND"
   */
  code: string;

  /**
   * Human-readable error description (localized or raw)
   * @example "Authentication required"
   * @example "User profile not found"
   */
  message: string;

  /**
   * Optional technical details for debugging
   * @example "Failed to verify JWT token"
   * @example "User ID: 123 | Path: /api/v1/users"
   */
  details?: string | null;
}

/**
 * Standardized HTTP error class for API responses
 * @example
 * // Basic usage
 * throw new HttpError({
 *   statusCode: 404,
 *   code: "NOT_FOUND",
 *   message: "Resource not found"
 * });
 *
 * @example
 * // Error with debug details
 * throw new HttpError({
 *   statusCode: 403,
 *   code: "FORBIDDEN",
 *   message: "Insufficient permissions",
 *   details: "User tried accessing /admin"
 * });
 */
export class HttpError extends Error {
  /**
   * HTTP status code from the error options
   * @example 401 // Unauthorized
   */
  public readonly statusCode: number;

  /**
   * Machine-readable code from the error options
   * @example "VALIDATION_ERROR"
   */
  public readonly code: string;

  /**
   * Technical details from the error options
   * @example "Invalid email format: 'user@example'"
   */
  public readonly details?: string | null;

  /**
   * Creates a new HttpError instance
   * @param opts - Configuration options for the error
   */
  constructor(opts: HttpErrorOptions) {
    super(opts.message);
    this.name = 'HttpError';
    this.statusCode = opts.statusCode;
    this.code = opts.code;
    this.details = opts.details;
  }
}
