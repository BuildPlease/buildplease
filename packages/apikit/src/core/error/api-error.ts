import { type JSONSerializable, filterObject } from '@nidavellirx/meowv-core';

export type ApiErrorDetails = string | string[] | Record<string, string[]>;

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

  static with(properties: ApiErrorProperties, customMessage?: string): ApiError {
    return new ApiError({
      ...properties,
      message: customMessage ?? properties.message,
    });
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

  private formatDetails(details?: ApiErrorDetails): Record<string, string[]> | undefined {
    if (!details) return undefined;

    // MARK: - Single string
    if (typeof details === 'string') {
      return { _error: [details] };
    }

    // MARK: - Array of strings
    if (Array.isArray(details)) {
      return { _errors: details };
    }

    // MARK: - Already formatted
    return details;
  }
}
