import { CanceledError, HttpError } from '@buildplease/webkit';

import { useNuxtApp } from '#app';
import { useNuxtKit } from '#internal-runtime';
import { resolveI18nMessage } from '#nuxtkit/i18n';

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
 * 1. If the error is a `CanceledError`, return null.
 * 2. If `options.handle` is provided, return its result.
 * 3. If the error is a `HttpError`, return its message.
 * 4. Otherwise, resolve the configured generic L10n key and literal fallback.
 *
 * @param error - The error object to handle.
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
  const errors = kit.config.errors;

  return resolveI18nMessage(app.$i18n, errors.genericErrorKey, errors.genericMessageFallback);
}

const DEFAULTS: ErrorHandlerOptions = {
  handle: undefined,
  log: false,
};
