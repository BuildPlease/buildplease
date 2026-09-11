import type { HttpError } from './http-error';

/** Defines how a handled secured HTTP error affects queued request execution. */
export type HttpErrorResolution = 'handle' | 'interrupt';

/** Handles matching errors produced by secured HTTP resources. */
export interface HttpErrorInterceptor {
  /**
   * Resolves whether this interceptor handles the error.
   * `handle` handles only the current error.
   * `interrupt` interrupts the client queue before handling the error.
   */
  resolve(error: HttpError): HttpErrorResolution | undefined;

  /** Handles a resolved HTTP error. */
  handle(error: HttpError): void | Promise<void>;
}
