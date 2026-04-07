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
     * @example "An error occured"
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
     * @default "Access denied"
     * @example "Unauthorized"
     */
    unauthorizedMessageFallback?: string;
  };

  /**
   * Zod i18n integration (keeps Zod’s locale in sync with Nuxt i18n).
   */
  zodI18n: ZodI18nOptions;
}

/**
 * Base options shared by Zod i18n variants.
 */
export interface ZodI18nOptions {
  /**
   * Register module’s built-in locales into @nuxtjs/i18n.
   * Can be still overriden/extended via own files; i18n merges and later files win.
   *
   * - true  → auto-register built-ins for the app’s active locales (recommended default)
   * - false → do not register; you must provide all strings
   *
   * @default true
   */
  useModuleLocale?: boolean;

  /**
   * Region → base language grouping used during locale normalization.
   * Map a **base** language code to an array of its **region variants**.
   * This lets the module treat, for example, `en-GB` and `en-US` as `en`
   * when selecting Zod locales.
   *
   * @default
   * {
   *   en: ['en-GB', 'en-US'],
   *   sk: ['sk-SK'],
   *   cs: ['cs-CZ']
   * }
   *
   * @example
   * // Group common regioned locales under their base:
   * {
   *   en: ['en-GB', 'en-US'],
   *   pt: ['pt-BR', 'pt-PT'],
   * }
   *
   * @example
   * // Minimal setup (only base codes used in the app):
   * {}
   */
  languageAlias?: Record<string, string[]>;

  /**
   * Common key prefix where all Zod error strings live in your i18n files.
   * We’ll resolve keys like:
   *   `${keyPrefix}.common.invalid`
   *   `${keyPrefix}.date.min.inclusive`
   *   `${keyPrefix}.size.max.exclusive`
   *   ...
   *
   * @default "zod"
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
