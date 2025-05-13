import { type JSONSerializable, filterObject } from '@nidavellirx/meowv-core';

export interface ApiErrorProperties {
  code: string;
  message: string;
  statusCode: number;
  details?: string | unknown;
}

export class ApiError extends Error implements ApiErrorProperties, JSONSerializable {
  private _code: string;
  private _statusCode: number;
  private _details?: string | unknown;

  constructor({ code, message, statusCode, details }: ApiErrorProperties) {
    super(message);
    this._code = code;
    this._statusCode = statusCode;
    this._details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get code(): string {
    return this._code;
  }

  get statusCode(): number {
    return this._statusCode;
  }

  get details(): string | undefined | unknown {
    return this._details;
  }

  static with(error: ApiErrorProperties, customMessage?: string, details?: string): ApiError {
    return new ApiError({
      ...error,
      message: customMessage ?? error.message,
      details,
    });
  }

  public toJSON(): any {
    const json = {
      statusCode: this._statusCode,
      code: this._code,
      message: this.message,
      details: this._details,
    };

    return filterObject(json, {
      filterNull: true,
      filterUndefined: true,
      filterEmptyString: true,
      filterEmptyObject: true,
    });
  }
}
