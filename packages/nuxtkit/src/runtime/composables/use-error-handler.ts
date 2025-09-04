import { HttpError, UnauthorizedHttpError } from '@nidavellirx/meowv-webkit';

import { useNuxtApp, useRuntimeConfig } from '#app';

export interface ErrorHandlerOptions {
  /** Custom renderer for non-unauthorized HttpError */
  handle?: (error: HttpError) => string;
}

/**
 * Resolve any error into a localized, user-facing message.
 *
 * Steps:
 * 1. If the error is an `UnauthorizedHttpError`, return the unauthorized i18n key or fallback.
 * 2. If the error is a `HttpError`, return a custom handler result (if provided) or the raw message.
 * 3. Otherwise, return the generic i18n key or fallback.
 *
 * @param error   - Error object to handle (may be `HttpError`, `UnauthorizedHttpError`, or generic).
 * @param options - Optional configuration (e.g., custom handler for `HttpError`).
 * @returns Localized error message string.
 *
 * @example
 * try {
 *   await resource.execute(input);
 * } catch (err) {
 *   const message = useErrorHandler(err, {
 *     handle: (e) => `Custom: ${e.code}`,
 *   });
 *   console.error(message);
 * }
 */
export function useErrorHandler(error: unknown, options: ErrorHandlerOptions = {}): string {
  const app = useNuxtApp();
  const config = useRuntimeConfig().public.meowvNuxtKit.error;
  const { t, te } = app.$i18n;

  // Step 1: Unauthorized error → return unauthorized message
  if (error instanceof UnauthorizedHttpError) {
    const key = config.unauthorizedKey;
    return te(key) ? t(key) : config.unauthorizedMessageFallback;
  }

  // Step 2: Other HttpError → custom handler or raw message
  if (error instanceof HttpError) {
    return options.handle ? options.handle(error) : error.message;
  }

  // Step 3: Non-HttpError → generic key or fallback
  const genericKey = config.genericErrorKey;
  const genericFallback = config.genericMessageFallback;
  return te(genericKey) ? t(genericKey) : genericFallback;
}
