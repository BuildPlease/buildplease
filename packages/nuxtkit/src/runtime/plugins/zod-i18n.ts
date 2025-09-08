import z, { locales as zodLocales } from 'zod';
import { watch } from 'vue';

import { defineNuxtPlugin } from '#imports';
import { useNuxtKit } from '#nuxtkit/composables/use-nuxt-kit';
import { useCurrentLocale } from '#nuxtkit/composables/use-current-locale';
import type { ZodLocaleFactory } from '#nuxtkit/types/zod';

/**
 * Nuxt plugin: keeps Zod v4 error locale in sync with vue-i18n locale.
 *
 * @remarks
 * - Uses `useCurrentLocale({ withRegion: false })` for base language.
 * - Supports optional `languageAlias` and `customLocales` from module config.
 */
export default defineNuxtPlugin(async () => {
  const kit = useNuxtKit();
  const cfg = kit.config.zodI18n;

  const alias: Record<string, string> = cfg?.languageAlias ?? {};
  const custom: Record<string, string> = cfg?.customLocales ?? {};

  async function loadZodLocaleFactory(base: string): Promise<ZodLocaleFactory> {
    const code = alias[base] ?? base;

    // 0) custom module path
    const customPath = custom[code];
    if (customPath) {
      try {
        const mod = await import(/* @vite-ignore */ customPath);
        const f = (mod.default ?? mod) as unknown;
        if (typeof f === 'function') return f as ZodLocaleFactory;
      } catch {}
    }

    // 1) built-ins (tree-shakable)
    const builtin = (zodLocales as Record<string, unknown>)[code];
    if (typeof builtin === 'function') return builtin as ZodLocaleFactory;

    // 2) dynamic import official locale
    try {
      const mod = await import(/* @vite-ignore */ `zod/v4/locales/${code}.js`);
      return (mod.default ?? mod) as ZodLocaleFactory;
    } catch {}

    // 3) english fallback
    const en = await import('zod/v4/locales/en.js');
    return en.default as ZodLocaleFactory;
  }

  async function applyZodLocaleFromComputed(baseLocale: string) {
    const factory = await loadZodLocaleFactory(baseLocale);
    z.config(factory());
  }

  // Initial (SSR + client)
  const currentBase = useCurrentLocale({ withRegion: false });
  await applyZodLocaleFromComputed(currentBase.value);

  // React to changes (client)
  if (kit.isClient) {
    watch(currentBase, (val) => {
      applyZodLocaleFromComputed(val);
    });
  }
});
