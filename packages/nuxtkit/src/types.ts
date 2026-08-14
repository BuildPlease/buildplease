import type { DeepRequired } from '@meawkit/webkit';

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
   * Zod i18n integration (keeps Zod’s locale in sync with Nuxt i18n).
   */
  zodI18n: ZodI18nOptions;

  /**
   * Auto-imported components provided by the module.
   */
  components: {
    /**
     * Optional prefix for all auto-imported components.
     * @default ""
     * @example "NuxtKit"
     */
    prefix: string;
  };

  /**
   * Error message keys and fallbacks.
   */
  errors: {
    /**
     * L10n key for a generic error.
     * @default "nuxtkit.error.generic"
     * @example "error.generic"
     */
    genericErrorKey?: string;

    /**
     * Fallback when the generic key is missing.
     * @default "Something went wrong"
     * @example "An error occured"
     */
    genericMessageFallback?: string;

    /**
     * L10n key for an unauthorized error.
     * @default "nuxtkit.error.unauthorized"
     * @example "error.unauthorized"
     */
    unauthorizedKey?: string;

    /**
     * Fallback when the unauthorized key is missing.
     * @default "Access denied."
     * @example "Access denied."
     */
    unauthorizedMessageFallback?: string;
  };

  /**
   * HTTP status codes to treat as unauthorized.
   * @default [401]
   * @example [401, 403]
   */
  unauthorizedStatusCodes: number[];
}

/**
 * Zod i18n options.
 */
export interface ZodI18nOptions {
  /**
   * Common key prefix where all Zod error strings live in your i18n files.
   * We’ll resolve keys like:
   *   `${keyPrefix}.common.invalid`
   *   `${keyPrefix}.date.min.inclusive`
   *   `${keyPrefix}.size.max.exclusive`
   *   ...
   *
   * @default "nuxtkit.zod"
   * @example
   * // If your translations live under "errors.validation.zod.*":
   * keyPrefix: "errors.validation.zod"
   *
   * // Or a flat namespace like "validation":
   * keyPrefix: "validation"
   */
  keyPrefix?: string;

  /**
   * Date-time formatting options used when rendering Zod’s date limits
   * (`z.date().min()/max()` and `exact`) via `i18n.d(value, options)`.
   * If omitted, the locale’s default `Intl.DateTimeFormat` is used.
   *
   * @default { day: "numeric", month: "long", year: "numeric" }
   * @example
   * { dateStyle: "medium", timeZone: "Europe/Bratislava" }
   */
  dateFormat?: Intl.DateTimeFormatOptions;
}
