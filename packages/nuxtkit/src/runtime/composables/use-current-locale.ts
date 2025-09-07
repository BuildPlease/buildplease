import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export interface UseCurrentLocaleOptions {
  /** Region segment (e.g., `en-GB`).
   * @default base-only (e.g., `en`).
   */
  withRegion?: boolean;
}

function firstLocale(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.find(Boolean) as string | undefined;
  if (val && typeof val === 'object') {
    const v = (val as Record<string, unknown>).default ?? Object.values(val)[0];
    return firstLocale(v);
  }
  return undefined;
}

function withoutRegion(code: string): string {
  const i = code.indexOf('-');
  return (i === -1 ? code : code.slice(0, i)).toLowerCase();
}

/**
 * Returns the current locale from @nuxtjs/i18n (via vue-i18n), optionally normalized to a base language.
 *
 * Priority:
 * 1. `i18n.locale`
 * 2. `i18n.fallbackLocale` (first defined)
 * 3. `'en'` if neither is available
 *
 * @param options - Behavior flags (e.g., keep region segment).
 * @returns A computed string with the current locale (e.g., `en` or `en-GB`).
 *
 * @example
 * const current = useCurrentLocale();        // => 'en'
 * const currentFull = useCurrentLocale({ withRegion: true }); // => 'en-GB'
 */
export function useCurrentLocale(options: UseCurrentLocaleOptions = {}) {
  const { withRegion = false } = options;
  const { locale, fallbackLocale } = useI18n();

  return computed<string>(() => {
    const current = locale.value || firstLocale(fallbackLocale.value) || '';
    return withRegion ? current : withoutRegion(current);
  });
}
