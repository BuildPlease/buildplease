import type { HttpError } from '@nidavellirx/meowv-webkit';

/**
 * Configuration for the public runtime settings in the NuxtKit module.
 */
export interface NuxtKitPublicRuntimeConfig {
  /**
   * List of status codes that are considered unauthorized.
   *
   * @default [401]
   * @example [401, 403]
   */
  unauthorizedStatusCodes: NuxtKitOptions['unauthorizedStatusCodes'];

  /**
   * The error messages used by the application.
   * This object contains localized keys for various types of errors.
   */
  errors: NuxtKitOptions['errors'];
}

/**
 * Options for configuring NuxtKit's error handling and unauthorized status codes.
 */
export interface NuxtKitOptions {
  /**
   * An array of HTTP status codes that indicate unauthorized access.
   * Typically used for status codes like 401 (Unauthorized) or 403 (Forbidden).
   *
   * @default [401]
   * @example [401, 403]
   */
  unauthorizedStatusCodes: number[];

  errors: {
    /**
     * The fallback key for generic error messages.
     *
     * @default "errors.generic"
     */
    genericErrorKey: string;

    /**
     * Fallback message for generic errors when no specific message is found in i18n.
     *
     * @default "Something went wrong"
     */
    genericMessageFallback: string;

    /**
     * The fallback key for unauthorized error messages.
     *
     * @default "errors.unauthorized"
     */
    unauthorizedKey: string;

    /**
     * Fallback message for unauthorized errors when no specific message is found in i18n.
     *
     * @default "Unauthorized"
     */
    unauthorizedMessageFallback: string;
  };
}

export type UnauthorizedHookContext = {
  /**
   * The HttpError object that caused the unauthorized action.
   */
  error: HttpError;

  /**
   * A boolean indicating if the context is on the server-side (SSR) or client-side.
   */
  isSSR: boolean;

  /**
   * The function that handles redirection after an unauthorized error.
   *
   * @param to The path to redirect the user to.
   * @returns A promise that resolves after the redirection.
   */
  redirect: (to: string) => Promise<void>;
};
