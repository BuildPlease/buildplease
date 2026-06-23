import { readdir } from 'node:fs/promises';

import type { Nuxt } from '@nuxt/schema';
import type { LocaleObject, NuxtI18nOptions } from '@nuxtjs/i18n';

import type { NuxtKitContext } from '../context';

/**
 * Register Zod locales from this module based on application i18n locales.
 *
 * @returns Resolves when locale registration is completed or skipped.
 */
export async function prepareZodLocales(
  context: NuxtKitContext,
  nuxt: Nuxt,
  i18nOptions: NuxtI18nOptions | null,
): Promise<void> {
  const { resolver, logger, options } = context;

  if (!options.zodI18n.useModuleLocale) {
    logger.info('[NuxtKit:ZodI18n] Skipping locale setup: module locale support is disabled');
    return;
  }

  if (!i18nOptions) {
    logger.info('[NuxtKit:ZodI18n] Skipping locale setup: i18n integration is disabled');
    return;
  }

  try {
    const rawAppCodes = collectApplicationLocaleCodes(i18nOptions.locales);

    const langDir = resolver.resolve('./runtime/zod/locales');
    const shippedRegions = await readShippedRegionCodes(langDir);
    const aliasToBase = buildAliasToBaseMap(options.zodI18n.languageAlias);
    const baseToPreferred = buildBaseToPreferredRegions(options.zodI18n.languageAlias);
    const baseToShipped = groupShippedByBase(shippedRegions);

    const allowedCodes = buildAllowedLocaleCodeSet(i18nOptions.locales);

    nuxt.hook('i18n:registerModule', (register) => {
      type RegisterConfig = Parameters<typeof register>[0];
      type RegisterLocales = Exclude<RegisterConfig['locales'], undefined>;
      type AllowedCode = RegisterLocales extends LocaleObject<infer C>[] ? C : never;

      const appCodes = rawAppCodes.filter((code): code is AllowedCode => allowedCodes.has(code));

      const localesToRegister = computeLocalesToRegister<AllowedCode>(
        appCodes,
        shippedRegions,
        aliasToBase,
        baseToPreferred,
        baseToShipped,
      );

      if (localesToRegister.length === 0) {
        logger.debug('[NuxtKit:ZodI18n] No locales to register; skipping i18n:registerModule');
        return;
      }

      register({ langDir, locales: localesToRegister });

      logger.debug(
        `[NuxtKit:ZodI18n] Registered → ${localesToRegister.map((locale) => `${locale.code} ← ${locale.file}`).join(', ')}`,
      );
    });
  } catch (error) {
    logger.fatal('[NuxtKit:ZodI18n] Failed: ', error);
  }
}

// MARK: - Private

/**
 * Build a set of allowed locale codes from Nuxt i18n locale entries.
 *
 * @returns A set of locale codes accepted by the application.
 */
function buildAllowedLocaleCodeSet(locales: NuxtI18nOptions['locales']): Set<string> {
  const allowed = new Set<string>();
  if (!locales) return allowed;

  for (const entry of locales) {
    if (typeof entry === 'string') allowed.add(entry);
    else if (entry?.code) allowed.add(entry.code);
    else if (entry?.language) allowed.add(entry.language);
  }

  return allowed;
}

/**
 * Collect application locale codes in stable order without duplicates.
 *
 * @returns Ordered unique locale codes from application i18n config.
 */
function collectApplicationLocaleCodes(locales: NuxtI18nOptions['locales']): string[] {
  if (!locales) return [];

  const collected: string[] = [];
  for (const entry of locales) {
    if (typeof entry === 'string') collected.push(entry);
    else if (entry?.code) collected.push(entry.code);
    else if (entry?.language) collected.push(entry.language);
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const code of collected) {
    if (!seen.has(code)) {
      seen.add(code);
      unique.push(code);
    }
  }

  return unique;
}

/**
 * Read shipped locale region codes from JSON files.
 *
 * @returns A set of shipped region codes such as `en-US` or `sk-SK`.
 */
async function readShippedRegionCodes(languageDirectory: string): Promise<Set<string>> {
  let files: string[];
  try {
    files = await readdir(languageDirectory);
  } catch {
    throw new Error(`zod-i18n: cannot read locale directory: ${languageDirectory}`);
  }

  const regions = files.filter((file) => file.endsWith('.json')).map((file) => file.replace(/\.json$/i, ''));
  if (regions.length === 0) throw new Error(`zod-i18n: no locale JSON files found in: ${languageDirectory}`);
  return new Set(regions);
}

/**
 * Build a case-insensitive alias-to-base-language map.
 *
 * @returns A map like `en-gb -> en`.
 */
function buildAliasToBaseMap(languageAlias?: Record<string, string[]>): Map<string, string> {
  const map = new Map<string, string>();
  for (const [base, regions] of Object.entries(languageAlias ?? {})) {
    for (const region of regions) map.set(region.toLowerCase(), base);
  }
  return map;
}

/**
 * Build a base-language to preferred-regions map.
 *
 * @returns A map like `en -> ['en-US', 'en-GB']`.
 */
function buildBaseToPreferredRegions(languageAlias?: Record<string, string[]>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [base, regions] of Object.entries(languageAlias ?? {})) {
    map.set(base, regions);
  }
  return map;
}

/**
 * Group shipped region codes by base language.
 *
 * @returns A map like `en -> ['en-US', 'en-GB']`.
 */
function groupShippedByBase(shippedRegionCodes: Set<string>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const region of shippedRegionCodes) {
    const dash = region.indexOf('-');
    const base = dash === -1 ? region : region.slice(0, dash);
    const list = map.get(base);
    if (list) list.push(region);
    else map.set(base, [region]);
  }
  return map;
}

/**
 * Find a canonical shipped region code by exact case-insensitive match.
 *
 * @returns The canonical shipped region code when found.
 */
function findShippedRegion(shippedRegions: Set<string>, code: string): string | undefined {
  const lower = code.toLowerCase();
  for (const region of shippedRegions) {
    if (region.toLowerCase() === lower) return region;
  }
  return undefined;
}

/**
 * Pick the best shipped region for a base language.
 *
 * @returns A preferred shipped region when available, otherwise the first shipped region.
 */
function pickRegionForBase(
  base: string,
  baseToPreferred: Map<string, string[]>,
  baseToShipped: Map<string, string[]>,
): string | undefined {
  const shipped = baseToShipped.get(base);
  if (!shipped || shipped.length === 0) return undefined;

  const prefs = baseToPreferred.get(base) ?? [];
  for (const pref of prefs) {
    if (shipped.includes(pref)) return pref;
  }

  return shipped[0];
}

/**
 * Resolve a shipped region file for an application locale code.
 *
 * @returns A shipped region code when resolvable.
 */
function resolveRegionForAppCode(
  appCode: string,
  shippedRegions: Set<string>,
  aliasToBase: Map<string, string>,
  baseToPreferred: Map<string, string[]>,
  baseToShipped: Map<string, string[]>,
): string | undefined {
  const exact = findShippedRegion(shippedRegions, appCode);
  if (exact) return exact;

  const aliasBase = aliasToBase.get(appCode.toLowerCase());
  const dash = appCode.indexOf('-');
  const inferredBase = dash === -1 ? appCode : appCode.slice(0, dash);
  const base = aliasBase ?? inferredBase;

  return pickRegionForBase(base, baseToPreferred, baseToShipped);
}

/**
 * Map application locale codes to shipped locale files.
 *
 * @returns Locale objects suitable for `i18n:registerModule`.
 */
function computeLocalesToRegister<TCode extends string>(
  applicationLocaleCodes: TCode[],
  shippedRegionCodes: Set<string>,
  aliasToBaseMap: Map<string, string>,
  baseToPreferredRegions: Map<string, string[]>,
  baseToShipped: Map<string, string[]>,
): LocaleObject<TCode>[] {
  const result: LocaleObject<TCode>[] = [];

  for (const appCode of applicationLocaleCodes) {
    const region = resolveRegionForAppCode(
      appCode,
      shippedRegionCodes,
      aliasToBaseMap,
      baseToPreferredRegions,
      baseToShipped,
    );
    if (region) result.push({ code: appCode, file: `${region}.json` });
  }

  return result;
}
