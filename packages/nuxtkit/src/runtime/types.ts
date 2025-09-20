import type { HttpError } from '@nidavellirx/meowv-webkit';

/**
 * Context passed to the 'meowv:unauthorized' hook.
 */
export type UnauthorizedHookContext = {
  /** The HttpError that triggered the unauthorized state. */
  error: HttpError;
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
