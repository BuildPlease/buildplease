import { computed } from 'vue';

import { useNuxtApp } from '#imports';

export interface UseCurrentLocaleOptions {
  /** Whether to preserve the region segment (e.g. `"en-GB"`). */
  withRegion?: boolean;
}

/**
 * Resolve the current locale from Nuxt's `$i18n` instance.
 *
 * Priority:
 * 1. `i18n.locale`
 * 2. First entry of `i18n.fallbackLocale`
 * 3. Throws if neither is available
 *
 * @param options - Control behavior (e.g. keep region).
 * @returns A reactive `computed` locale string (e.g. `"en"` or `"en-GB"`).
 * @throws When no active locale or fallback locale is configured.
 */
export function useCurrentLocale(options: UseCurrentLocaleOptions = {}) {
  const { withRegion = false } = options;
  const app = useNuxtApp();
  const i18n = app.$i18n;

  return computed<string>(() => {
    const current = i18n.locale.value || firstLocale(i18n.fallbackLocale.value);
    if (!current) {
      throw new Error('[useCurrentLocale] No active locale and no fallbackLocale configured.');
    }
    return withRegion ? current : normalizeLocale(current, { preserveRegion: false });
  });
}

/**
 * Extracts the first locale value from a vue-i18n `fallbackLocale` config.
 *
 * @param val - A locale string, array, or object with nested values.
 * @returns The first available locale string, or `undefined`.
 */
function firstLocale(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.find(Boolean) as string | undefined;
  if (val && typeof val === 'object') {
    const v = (val as Record<string, unknown>).default ?? Object.values(val)[0];
    return firstLocale(v);
  }
  return undefined;
}

/**
 * Normalize a locale code to either its base language or full region form.
 *
 * @param input - The locale string to normalize (e.g. `"en-GB"`).
 * @param options.preserveRegion - If true, keeps the full region (e.g. `"en-gb"`).
 * @throws When no input is provided.
 * @returns The normalized locale (e.g. `"en"` or `"en-gb"`).
 */
export function normalizeLocale(input: string | undefined | null, options: { preserveRegion?: boolean } = {}): string {
  const raw = input?.trim();
  if (!raw) throw new Error('[normalizeLocale] No locale provided.');

  const lower = raw.toLowerCase();
  if (options.preserveRegion) return lower;

  const i = lower.indexOf('-');
  return i === -1 ? lower : lower.slice(0, i);
}
