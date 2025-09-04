export interface NuxtZodi18nOptions {
  dateFormat: Intl.DateTimeFormatOptions;
  useModuleLocale: boolean;
  localeCodesMapping?: Record<string, string> | null;
}

export interface Zodi18nPublicRuntimeConfig {
  dateFormat: NuxtZodi18nOptions['dateFormat'];
}
