import { readdir } from 'node:fs/promises';

import type { Nuxt } from '@nuxt/schema';
import type { LocaleObject, NuxtI18nOptions } from '@nuxtjs/i18n';

import type { NuxtKitContext } from '../context';

/**
 * Register NuxtKit locale resources through the Nuxt I18n module hook.
 */
export async function prepareI18nLocales(context: NuxtKitContext, nuxt: Nuxt): Promise<void> {
  const { resolver, logger } = context;
  const langDir = resolver.resolve('./runtime/i18n/locales');
  const shippedLocales = await readShippedLocaleCodes(langDir);

  nuxt.hook('i18n:registerModule', (register) => {
    const locales = resolveModuleLocales(nuxt.options.i18n?.locales, shippedLocales);

    if (locales.length === 0) {
      logger.debug('[NuxtKit:I18n] No supported application locales found; skipping module locale registration');
      return;
    }

    register({
      langDir: langDir,
      locales: locales,
    });

    logger.debug(
      `[NuxtKit:I18n] Registered → ${locales.map((locale) => `${locale.code} ← ${String(locale.file)}`).join(', ')}`,
    );
  });
}

/**
 * Map application locale codes to shipped NuxtKit locale files.
 */
export function resolveModuleLocales(
  applicationLocales: NuxtI18nOptions['locales'],
  shippedLocaleCodes: readonly string[],
): LocaleObject[] {
  if (!applicationLocales || shippedLocaleCodes.length === 0) return [];

  const shipped = [...shippedLocaleCodes].sort((left, right) => left.localeCompare(right));
  const result: LocaleObject[] = [];

  for (const applicationLocale of applicationLocales) {
    const code = typeof applicationLocale === 'string' ? applicationLocale : applicationLocale.code;
    const language = typeof applicationLocale === 'string' ? applicationLocale : applicationLocale.language;
    const shippedCode = resolveShippedLocaleCode(code, language, shipped);

    if (!shippedCode) continue;

    result.push({
      code: code,
      file: `${shippedCode}.json`,
    });
  }

  return result;
}

// MARK: - Private

async function readShippedLocaleCodes(languageDirectory: string): Promise<string[]> {
  const files = await readdir(languageDirectory);
  const localeCodes = files
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/i, ''))
    .sort((left, right) => left.localeCompare(right));

  if (localeCodes.length === 0) {
    throw new Error(`[NuxtKit:I18n] No locale JSON files found in: ${languageDirectory}`);
  }

  return localeCodes;
}

function resolveShippedLocaleCode(
  applicationCode: string,
  applicationLanguage: string | undefined,
  shippedLocaleCodes: readonly string[],
): string | undefined {
  const candidates = applicationLanguage ? [applicationLanguage, applicationCode] : [applicationCode];

  for (const candidate of candidates) {
    const exact = findLocaleCode(candidate, shippedLocaleCodes);
    if (exact) return exact;
  }

  for (const candidate of candidates) {
    const language = getBaseLanguage(candidate);
    const byLanguage = shippedLocaleCodes.find((shippedCode) => getBaseLanguage(shippedCode) === language);
    if (byLanguage) return byLanguage;
  }

  return undefined;
}

function findLocaleCode(localeCode: string, shippedLocaleCodes: readonly string[]): string | undefined {
  const normalized = localeCode.toLowerCase();
  return shippedLocaleCodes.find((shippedCode) => shippedCode.toLowerCase() === normalized);
}

function getBaseLanguage(localeCode: string): string {
  try {
    return new Intl.Locale(localeCode).language;
  } catch {
    return localeCode.split('-')[0]?.toLowerCase() ?? localeCode.toLowerCase();
  }
}
