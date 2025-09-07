import type { HttpError } from '@nidavellirx/meowv-webkit';

/**
 * Public runtime config exposed by the NuxtKit module.
 */
export type NuxtKitPublicRuntimeConfig = DeepRequired<NuxtKitOptions>;

/**
 * NuxtKit configuration.
 */
export interface NuxtKitOptions {
  /** Whether to print debug logs at runtime. */
  debug: boolean;
  /**
   * HTTP status codes to treat as unauthorized.
   * @default [401]
   * @example [401, 403]
   */
  unauthorizedStatusCodes: number[];

  /**
   * Error message keys and fallbacks.
   */
  errors: {
    /** 
     * i18n key for a generic error. 
     * @default "errors.generic" 
     * @example "errors.generic" 
  
     */
    genericErrorKey?: string;

    /**
     * Fallback when the generic key is missing.
     * @default "Something went wrong"
     * @example "Something went wrong"
     */
    genericMessageFallback?: string;

    /**
     * i18n key for an unauthorized error.
     * @default "errors.unauthorized"
     * @example "errors.unauthorized"
     */
    unauthorizedKey?: string;

    /**
     * Fallback when the unauthorized key is missing.
     * @default "Unauthorized"
     * @example "Unauthorized"
     */
    unauthorizedMessageFallback?: string;
  };

  /**
   * Zod i18n integration (keeps Zod’s locale in sync with Nuxt i18n).
   * Region codes are stripped internally (e.g. "en-GB" → "en").
   */
  zodI18n: {
    /**
     * Fallback Zod locale id when nothing matches.
     * @default "en"
     * @example "en"
     */
    fallback?: string;

    /**
     * Base-language remapping (after region is stripped).
     * Use this when Zod lacks a locale and you want to reuse another.
     * @default "{}"
     * @example map Slovak ("sk") to Czech ("cs"): { "sk": "cs" }
     */
    languageAlias?: Record<string, string>;

    /**
     * Base-language → module path exporting a **custom Zod 4 locale factory**.
     *
     * The module MUST export:
     *   `export default function () { return { localeError } }`
     *
     * where `localeError` is a function `(issue) => string` — same shape as Zod’s built-ins
     * (e.g., `zod/v4/locales/cs.js`).
     *
     * Use this to supply real translations for languages Zod doesn’t ship.
     * @default "{}"
     * @example { "sk": "~/zod-locales/sk" }
     */
    customLocales?: Record<string, string>;
  };
}

/**
 * Context passed to the 'meowv:unauthorized' hook.
 */
export type UnauthorizedHookContext = {
  /** The HttpError that triggered the unauthorized state. */
  error: HttpError;
  /** True when running on the server (SSR). */
  isSSR: boolean;
  /** Redirect helper. */
  redirect: (to: string) => Promise<void>;
};

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type DeepRequired<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends Primitive
    ? T
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepRequired<U>>
      : T extends Array<infer U>
        ? Array<DeepRequired<U>>
        : { [K in keyof T]-?: DeepRequired<NonNullable<T[K]>> };
