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
    const rawAppCodes = collectApplicationLocaleCodes(i18nOptions?.locales);

    const langDir = resolver.resolve('./runtime/zod/locales');
    const shippedRegions = await readShippedRegionCodes(langDir);
    const aliasToBase = buildAliasToBaseMap(options.zodI18n.languageAlias);
    const baseToPreferred = buildBaseToPreferredRegions(options.zodI18n.languageAlias);
    const baseToShipped = groupShippedByBase(shippedRegions);

    const allowedCodes = buildAllowedLocaleCodeSet(i18nOptions?.locales);

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
        logger.debug('[zod-i18n] no locales to register; skipping i18n:registerModule');
        return;
      }

      register({ langDir, locales: localesToRegister });

      logger.debug(
        `[zod-i18n] registered → ${localesToRegister.map((l) => `${l.code} ← ${l.file}`).join(', ')}`,
      );
    });
  } catch (error) {
    logger.fatal('[zod-i18n] failed: ', error);
  }
}

// MARK: - Private

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

/** Collect app locale codes (ordered, unique). Accepts string entries or objects with .code/.language */
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

  return shipped[0];
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
