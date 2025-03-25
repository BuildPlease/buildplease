import { JSONSerializable } from '@nidavellirx/meowv-core';

export interface ApiErrorProperties {
  identifier: string;
  message: string;
  statusCode: number;
}

/**
 * Custom Api Error class that extends the built-in Error class
 * to include error codes and status codes.
 */
export class ApiError
  extends Error
  implements ApiErrorProperties, JSONSerializable
{
  private _identifier: string;
  private _statusCode: number;

  constructor({ identifier, message, statusCode }: ApiErrorProperties) {
    super(message);
    this._identifier = identifier;
    this._statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get identifier(): string {
    return this._identifier;
  }

  get statusCode(): number {
    return this._statusCode;
  }

  /**
   * Creates a new `ApiError` instance with optional message override.
   */
  static with(error: ApiErrorProperties, customMessage?: string) {
    return new ApiError({
      ...error,
      message: customMessage ?? error.message,
    });
  }

  public toJSON() {
    return {
      statusCode: this._statusCode,
      identifier: this._identifier,
      message: this.message,
    };
  }
}
