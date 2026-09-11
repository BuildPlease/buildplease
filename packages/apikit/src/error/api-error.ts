import { type JSONSerializable, filterObject } from '@buildplease/core';
import { FrameworkIdentity } from '@buildplease/identity';

const Identity = Symbol.for(`${FrameworkIdentity.name}.ApiError`);

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
    Object.defineProperty(this, Identity, {
      value: true,
      enumerable: false,
      configurable: false,
      writable: false,
    });
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

  public static override [Symbol.hasInstance](value: unknown): boolean {
    if (this !== ApiError) {
      return Function.prototype[Symbol.hasInstance].call(this, value);
    }

    return typeof value === 'object' && value !== null && Identity in value;
  }
}
