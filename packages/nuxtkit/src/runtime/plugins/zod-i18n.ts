import { z } from 'zod';
import { watch } from 'vue';

import { defineNuxtPlugin } from '#imports';
import { useNuxtKit } from '#nuxtkit/composables/use-nuxt-kit';
import { useCurrentLocale } from '#nuxtkit/composables/use-current-locale';
import { locales } from '#nuxtkit/zod/locales/';

const ZOD_NAME = 'Zod';

/**
 * Nuxt plugin: handles Zod i18n locale management.
 *
 * @remarks
 * - Uses `useCurrentLocale({ withRegion: false })` to get the base language.
 * - Supports customLocales and built-in fallback locales.
 */
export default defineNuxtPlugin(async (_nuxt) => {
  const kit = useNuxtKit();
  const logger = kit.logger;
  const config = kit.config.zodI18n;

  const alias: Record<string, string> = config?.languageAlias ?? {};
  const custom: Record<string, string> = config?.customLocales ?? {};

  /**
   * Load the custom locale factory if user provides custom locale paths.
   * @param {string} locale - The base language code (e.g., 'en', 'sk', 'cs')
   */
  async function loadZodLocaleFactory(locale: string) {
    const code = alias[locale] ?? locale;

    // 0) Attempt to load custom locales first
    const customPath = custom[code];
    if (customPath) {
      try {
        const mod = await import(/* @vite-ignore */ customPath);
        return mod.default ?? mod;
      } catch {
        logger.warn(`${ZOD_NAME}: custom locale for ${code} not found`, { force: true });
      }
    }

    // 1) Check if the base locale is part of the internal locales (en, sk, cs, etc.)
    if (locales[code]) {
      return locales[code];
    }

    // 2) Try loading official Zod locales
    try {
      const mod = await import(/* @vite-ignore */ `zod/v4/locales/${code}.js`);
      return mod.default ?? mod;
    } catch {
      logger.warn(`${ZOD_NAME}: locale for ${code} not found.`, { force: true });
    }

    // 3) Default to English if no locale is found
    const enLocale = await import('zod/v4/locales/en.js');
    return enLocale.default;
  }

  /**
   * Apply the locale to Zod configuration.
   * @param locale - The base locale (e.g., 'en', 'sk', 'cs')
   */
  async function applyZodLocale(locale: string) {
    logger.info(`${ZOD_NAME}: locale applied: ${locale}`, { force: true });
    const localeFactory = await loadZodLocaleFactory(locale);
    z.config(localeFactory());
  }

  // MARK: - Initial locale setup (SSR + client)
  const currentBase = useCurrentLocale({ withRegion: false });
  await applyZodLocale(currentBase.value);

  // MARK: - React to locale changes on the client
  if (kit.isClient) {
    watch(currentBase, (val) => applyZodLocale(val));
  }
});
