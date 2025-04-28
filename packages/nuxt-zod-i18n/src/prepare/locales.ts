import { readdir } from 'node:fs/promises';

import type { Nuxt } from '@nuxt/schema';
import type { LocaleObject, NuxtI18nOptions } from '@nuxtjs/i18n';
import { isString } from '@intlify/shared';

import type { Zodi18nNuxtContext } from '../context';

/**
 * @returns LocaleObject[].
 */
export async function prepareLocales(
  ctx: Zodi18nNuxtContext,
  _nuxt: Nuxt,
  i18nOptions: NuxtI18nOptions,
): Promise<LocaleObject[]> {
  const { resolver, options } = ctx;

  // Normalize app-level locales
  const appLocalesCode = getNormalizedLocales(i18nOptions?.locales).map(({ code }) => code);

  // Read available language files
  const languageFiles = await readdir(resolver.resolve('./runtime/locales'));

  // Prepare valid locales based on files and mapping
  const locales = languageFiles.reduce<LocaleObject[]>((acc, file) => {
    const code =
      options.localeCodesMapping?.[file.replace('.json', '')] || file.replace('.json', '');

    if (appLocalesCode.includes(code)) {
      acc.push({ file, code });
    }

    return acc;
  }, []);

  return locales;
}

function getNormalizedLocales(locales: NuxtI18nOptions['locales']): LocaleObject[] {
  locales = locales || [];
  const normalized: LocaleObject[] = [];
  for (const locale of locales) {
    if (isString(locale)) {
      normalized.push({ code: locale, language: locale });
    } else {
      normalized.push(locale);
    }
  }
  return normalized;
}
