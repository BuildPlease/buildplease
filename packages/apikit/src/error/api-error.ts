import { type JSONSerializable, filterObject } from '@buildplease/core';

export type ApiErrorDetails = unknown;

export interface ApiErrorProperties {
  code: string;
  message: string;
  statusCode: number;
  details?: ApiErrorDetails;
}

export class ApiError extends Error implements ApiErrorProperties, JSONSerializable {
  private _code: string;
  private _statusCode: number;
  private _details?: ApiErrorDetails;

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

  get details(): ApiErrorDetails | undefined {
    return this._details;
  }

  public toJSON(): any {
    const json = {
      code: this._code,
      message: this.message,
      details: this.formatDetails(this.details),
    };

    return filterObject(json, {
      filterNull: true,
      filterUndefined: true,
      filterEmptyString: true,
      filterEmptyObject: true,
    });
  }

  private formatDetails(details?: unknown): unknown {
    if (details === undefined || details === null) {
      return undefined;
    }

    // MARK: Wrap plain string
    if (typeof details === 'string') {
      return { _error: [details] };
    }

    // MARK: Wrap array of strings
    if (Array.isArray(details) && details.every((d) => typeof d === 'string')) {
      return { _errors: details };
    }

    // MARK: For everything else, leave all other structures as-is
    return details;
  }
}
