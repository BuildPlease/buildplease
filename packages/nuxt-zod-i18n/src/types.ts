export interface Zodi18nPublicRuntimeConfig {
  dateFormat: Intl.DateTimeFormatOptions;
  localeCodesMapping?: Record<string, string>;
}

export interface NuxtZodi18nOptions {
  useModuleLocale: boolean;
  dateFormat: Intl.DateTimeFormatOptions;
  localeCodesMapping?: Record<string, string>;
}
