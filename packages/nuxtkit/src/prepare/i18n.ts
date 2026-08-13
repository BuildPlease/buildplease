import type { Nuxt } from '@nuxt/schema';
import type { LocaleObject } from '@nuxtjs/i18n';

import type { NuxtKitContext } from '../context';

const LOCALE_FILES = {
  en: 'en.json',
  sk: 'sk.json',
  cs: 'cs.json',
} as const;

type SupportedLanguage = keyof typeof LOCALE_FILES;
type ConfiguredLocale = string | LocaleObject;

/**
 * Register NuxtKit locale resources through the Nuxt I18n module hook.
 */
export async function prepareI18n(context: NuxtKitContext, nuxt: Nuxt): Promise<void> {
  const langDir = context.resolver.resolve('./runtime/i18n/locales');

  nuxt.hook('i18n:registerModule', (register) => {
    const locales = resolveModuleLocales(nuxt.options.i18n?.locales ?? []);

    if (locales.length === 0) return;

    register({
      langDir: langDir,
      locales: locales,
    });
  });
}

function resolveModuleLocales(configuredLocales: readonly ConfiguredLocale[]): LocaleObject[] {
  return configuredLocales.flatMap((configuredLocale) => {
    const code = typeof configuredLocale === 'string' ? configuredLocale : configuredLocale.code;
    const languageTag =
      typeof configuredLocale === 'string' ? configuredLocale : (configuredLocale.language ?? configuredLocale.code);
    const language = resolveSupportedLanguage(languageTag);

    if (!language) return [];

    return [
      {
        code: code,
        file: LOCALE_FILES[language],
      },
    ];
  });
}

function resolveSupportedLanguage(locale: string): SupportedLanguage | undefined {
  const normalizedLocale = locale.replaceAll('_', '-');

  try {
    return toSupportedLanguage(new Intl.Locale(normalizedLocale).language);
  } catch {
    return toSupportedLanguage(normalizedLocale.split('-').at(0));
  }
}

function toSupportedLanguage(language: string | undefined): SupportedLanguage | undefined {
  const normalizedLanguage = language?.toLowerCase();

  if (normalizedLanguage === 'en' || normalizedLanguage === 'sk' || normalizedLanguage === 'cs') {
    return normalizedLanguage;
  }

  return undefined;
}
