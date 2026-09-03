import type { HttpError } from './http-error';

export interface UnauthorizedHandler {
  handle(error: HttpError): Promise<void>;
}

export interface UnauthorizedOptions {
  /** HTTP status codes that trigger unauthorized handling. */
  readonly statusCodes: readonly number[];

  /** Whether unauthorized handling cancels all unresolved requests sharing the same HTTP client. */
  readonly cancelAll: boolean;

  /** Application-specific unauthorized handler. */
  readonly handler: UnauthorizedHandler;
}
