/**
 * Context passed to the unauthorized hook.
 */
export type UnauthorizedHookContext = {
  /** The Error that triggered the unauthorized state. */
  error: unknown;
  /** True when running on the server (SSR). */
  isSSR: boolean;
  /** Redirect helper. */
  redirect: (to: string, options?: UnauthorizedRedirectOptions) => Promise<void>;
};

/**
 * Options for unauthorized redirects.
 */
export interface UnauthorizedRedirectOptions {
  /**
   * Replace the current history entry instead of pushing.
   * Prevents user from going back to the unauthorized page.
   * @default false
   */
  replace?: boolean;
}
