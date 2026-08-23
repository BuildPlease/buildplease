import type { DeepRequired } from '@buildplease/webkit';

/** Public runtime config exposed by the NuxtKit module. */
export type NuxtKitPublicRuntimeConfig = DeepRequired<NuxtKitOptions>;

/** NuxtKit configuration. */
export interface NuxtKitOptions {
  /** Whether to print debug logs at runtime. */
  debug: boolean;

  /** Zod i18n integration (keeps Zod's locale in sync with Nuxt i18n). */
  zodI18n: ZodI18nOptions;

  /** Auto-imported components provided by the module. */
  components: {
    /**
     * Optional prefix for all auto-imported components.
     * @default ""
     * @example "NuxtKit"
     */
    prefix: string;
  };

  /** Error message keys and fallbacks. */
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
     * @example "An error occurred"
     */
    genericMessageFallback?: string;
  };
}

/** Zod i18n options. */
export interface ZodI18nOptions {
  /**
   * Common key prefix where all Zod error strings live in your i18n files.
   *
   * @default "nuxtkit.zod"
   * @example "errors.validation.zod"
   */
  keyPrefix?: string;

  /**
   * Date-time formatting options used when rendering Zod date limits.
   *
   * @default { day: "numeric", month: "long", year: "numeric" }
   */
  dateFormat?: Intl.DateTimeFormatOptions;
}
