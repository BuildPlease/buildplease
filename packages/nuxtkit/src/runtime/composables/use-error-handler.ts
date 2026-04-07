import { HttpError, CanceledError } from '@meawkit/webkit';

import { useNuxtApp } from '#app';
import { useNuxtKit } from '#nuxtkit-internal/composables';

export interface ErrorHandlerOptions {
  /**
   * Full override: if provided, all errors are passed here
   * and no default localization/fallback logic is used.
   *
   * @param error - The error object (could be any value).
   * @returns A localized or user-friendly error string.
   *
   * @default undefined
   */
  handle?: (error: unknown) => string | null;

  /**
   * Whether to log the error via NuxtKit logger.
   *
   * @default false
   */
  log?: boolean;
}

/**
 * Resolve any error into a localized, user-facing message.
 *
 * Steps:
 * 1. If `options.handle` is provided, its result is returned (full override).
 * 2. If the error is an `CanceledError`, return null.
 * 3. If the error is a `HttpError`, return its message.
 * 4. If the error is a generic `Error`, return its message.
 * 5. Otherwise, return the generic i18n key or fallback.
 *
 * @param error - The error object to handle (may be `HttpError`, `UnauthorizedHttpError`, `Error`, or anything).
 * @param options - Optional configuration for custom handling and logging.
 * @returns A localized string suitable for user-facing display.
 *
 * @example
 * try {
 *   await resource.execute(input)
 * } catch (error) {
 *   const message = useErrorHandler(error, {
 *     handle: (e) => `Custom: ${String(e)}`,
 *     log: true
 *   })
 *   console.error(message)
 * }
 */
export function useErrorHandler(error: unknown, options: ErrorHandlerOptions = DEFAULTS): string | null {
  if (error instanceof CanceledError) return null;

  const kit = useNuxtKit();

  if (options.log) {
    kit.logger.error(error, { force: true });
  }

  // Step 1: custom override
  if (options.handle) {
    return options.handle(error);
  }

  // Step 2: HttpError
  if (error instanceof HttpError) {
    return error.message;
  }

  // Step 3: Fallback
  const app = useNuxtApp();
  const { t, te } = app.$i18n;

  const errors = kit.config.errors;
  const genericKey = errors.genericErrorKey;
  const genericFallback = errors.genericMessageFallback;

  return te(genericKey) ? t(genericKey) : genericFallback;
}

const DEFAULTS: ErrorHandlerOptions = {
  handle: undefined,
  log: false,
};
