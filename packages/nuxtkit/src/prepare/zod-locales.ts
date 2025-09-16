import { readdir } from 'node:fs/promises';

import type { Nuxt } from '@nuxt/schema';
import type { NuxtI18nOptions, LocaleObject } from '@nuxtjs/i18n';

import type { NuxtKitContext } from '../context';

// MARK: - Public

export async function prepareZodLocales(
  context: NuxtKitContext,
  nuxt: Nuxt,
  i18nOptions: NuxtI18nOptions,
): Promise<void> {
  const { resolver, logger, options } = context;
  if (!options.zodI18n.useModuleLocale) return;

  try {
    // 1) app → ordered unique locale codes (prefers .code, falls back to .language, supports strings)
    const appCodes = collectApplicationLocaleCodes(i18nOptions?.locales);

    // 2) module → shipped region codes from <region>.json files (e.g. "en-US")
    const langDir = resolver.resolve('./runtime/zod/locales');
    const shippedRegions = await readShippedRegionCodes(langDir);

    // 3) alias maps
    const aliasToBase = buildAliasToBaseMap(options.zodI18n.languageAlias); // "en-GB" → "en"
    const baseToPreferred = buildBaseToPreferredRegions(options.zodI18n.languageAlias); // "en" → ["en-US","en-GB"]

    // 4) base → shipped regions
    const baseToShipped = groupShippedByBase(shippedRegions);

    // 5) app codes → shipped files
    const localesToRegister = computeLocalesToRegister(
      appCodes,
      shippedRegions,
      aliasToBase,
      baseToPreferred,
      baseToShipped,
    );

    // 6) register with @nuxtjs/i18n
    nuxt.hook('i18n:registerModule', (register) => {
      register({ langDir, locales: localesToRegister });
    });

    logger.debug(
      `[zod-i18n] registered → ${localesToRegister.map((l) => `${l.code} ← ${l.file}`).join(', ')}`,
    );
  } catch (error) {
    logger.fatal(error instanceof Error ? error.message : String(error));
  }
}

// MARK: - Private

/** Collect app locale codes (ordered, unique). Accepts string entries or objects with .code/.language */
function collectApplicationLocaleCodes(locales: NuxtI18nOptions['locales']): string[] {
  if (!locales) throw new Error('zod-i18n: no i18n locales configured.');

  const collected: string[] = [];
  for (const entry of locales as Array<string | LocaleObject>) {
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

  if (unique.length === 0) throw new Error('zod-i18n: resolved 0 locale codes from i18n configuration.');
  return unique;
}

/** Read shipped <region>.json files (e.g. returns Set["en-US","sk-SK"]) */
async function readShippedRegionCodes(languageDirectory: string): Promise<Set<string>> {
  let files: string[];
  try {
    files = await readdir(languageDirectory);
  } catch {
    throw new Error(`zod-i18n: cannot read locale directory: ${languageDirectory}`);
  }

  const regions = files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/i, ''));
  if (regions.length === 0) throw new Error(`zod-i18n: no locale JSON files found in: ${languageDirectory}`);
  return new Set(regions);
}

/** Alias → base (case-insensitive on alias), e.g. "en-GB" → "en" */
function buildAliasToBaseMap(languageAlias?: Record<string, string[]>): Map<string, string> {
  const map = new Map<string, string>();
  for (const [base, regions] of Object.entries(languageAlias ?? {})) {
    for (const region of regions) map.set(region.toLowerCase(), base);
  }
  return map;
}

/** Base → preferred regions (keep order), e.g. "en" → ["en-US","en-GB"] */
function buildBaseToPreferredRegions(languageAlias?: Record<string, string[]>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [base, regions] of Object.entries(languageAlias ?? {})) {
    map.set(base, regions);
  }
  return map;
}

/** Base → shipped regions, e.g. ["en-US","en-GB","sk-SK"] → { en:["en-US","en-GB"], sk:["sk-SK"] } */
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

/** Case-insensitive exact match against shipped regions; returns canonical cased region if found */
function findShippedRegion(shippedRegions: Set<string>, code: string): string | undefined {
  const lower = code.toLowerCase();
  for (const region of shippedRegions) {
    if (region.toLowerCase() === lower) return region;
  }
  return undefined;
}

/** Pick a shipped region for a base using preference order, fallback to any shipped region */
function pickRegionForBase(
  base: string,
  baseToPreferred: Map<string, string[]>,
  baseToShipped: Map<string, string[]>,
): string | undefined {
  const shipped = baseToShipped.get(base);
  if (!shipped || shipped.length === 0) return undefined;

  const prefs = baseToPreferred.get(base) ?? [];
  for (const pref of prefs) if (shipped.includes(pref)) return pref;

  return shipped[0]; // fallback
}

/** Resolve a shipped region filename for an app locale code */
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

/** Map app codes to shipped <region>.json files */
function computeLocalesToRegister(
  applicationLocaleCodes: string[],
  shippedRegionCodes: Set<string>,
  aliasToBaseMap: Map<string, string>,
  baseToPreferredRegions: Map<string, string[]>,
  baseToShipped: Map<string, string[]>,
): LocaleObject[] {
  const result: LocaleObject[] = [];

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

  if (result.length === 0) throw new Error('zod-i18n: none of the app locales map to shipped zod locales.');
  return result;
}
