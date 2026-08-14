import type { PluralizationRule } from 'vue-i18n';

/**
 * Options for configuring plural rules.
 */
export type PluralRulesOptions = {
  /**
   * Skip region-specific codes and only use base language codes.
   *
   * @default false
   */
  excludeRegions?: boolean;

  /**
   * Custom pluralization rules to override default rules for specific locales.
   */
  override?: Record<string, PluralizationRule>;
};

/**
 * Generates a record of pluralization rules for supported locales.
 * This function builds a collection of rules for pluralization based on locale codes and optional overrides.
 * It also supports region-specific plural rules, which can be included or excluded based on options.
 *
 * @param options - Options to customize plural rule generation.
 * @param options.excludeRegions - If true, region-specific codes will be excluded (defaults to false).
 * @param options.override - Custom rules for specific locales, which will be applied if provided.
 *
 * @returns A record of pluralization rules for each locale or region.
 *
 * @example
 * const rules = definePluralRules({ excludeRegions: true });
 * // Generates pluralization rules only for base languages, not region-specific codes.
 *
 * @example
 * const customRules = {
 *   en: (n) => (n === 1 ? 0 : 1),
 * };
 * const rules = definePluralRules({ override: customRules });
 * // Overrides the default rule for English with a custom rule.
 */
export function definePluralRules(options: PluralRulesOptions = {}): Record<string, PluralizationRule> {
  const rules: Record<string, PluralizationRule> = {};

  Object.entries(localePluralizationRules).forEach(([code, rule]) => {
    // Apply the custom rule if provided, otherwise use the default rule
    rules[code] = options.override?.[code] || rule;

    // If region-specific rules are not excluded, include them
    if (!options.excludeRegions && localeRegions[code]) {
      localeRegions[code].forEach((region) => {
        const regionCode = `${code}-${region}`;
        rules[regionCode] = options.override?.[regionCode] || rule;
      });
    }
  });

  return rules;
}

export const localePluralizationRules: Record<string, PluralizationRule> = {
  // Slovak
  sk: (n) => (n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2),
  // Czech
  cs: (n) => (n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2),
  // German
  de: (n) => (n === 1 ? 0 : 1),
  // English
  en: (n) => (n === 1 ? 0 : 1),
  // Spanish
  es: (n) => (n === 1 ? 0 : 1),
  // Persian (no plural)
  fa: () => 0,
  // French
  fr: (n) => (n > 1 ? 1 : 0),
  // Hungarian (no plural)
  hu: () => 0,
  // Indonesian (no plural)
  id: () => 0,
  // Italian
  it: (n) => (n === 1 ? 0 : 1),
  // Portuguese
  pt: (n) => (n === 1 ? 0 : 1),
  // Russian
  ru: (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return 0;
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 1;
    return 2;
  },
  // Turkish (no plural)
  tr: () => 0,
  // Ukrainian
  uk: (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return 0;
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 1;
    return 2;
  },
  // Chinese (no plural)
  zh: () => 0,
};

export const localeRegions: Record<string, string[]> = {
  // English
  en: ['US', 'GB', 'AU', 'CA'],
  // Slovak
  sk: ['SK'],
  // Czech
  cs: ['CZ'],
  // German
  de: ['DE'],
  // Spanish
  es: ['ES'],
  // Persian
  fa: ['IR'],
  // French
  fr: ['FR', 'CA'],
  // Hungarian
  hu: ['HU'],
  // Indonesian
  id: ['ID'],
  // Italian
  it: ['IT'],
  // Portuguese
  pt: ['PT', 'BR'],
  // Russian
  ru: ['RU'],
  // Turkish
  tr: ['TR'],
  // Ukrainian
  uk: ['UA'],
  // Chinese
  zh: ['CN', 'TW'],
};

export enum PluralState {
  Singular = 0,
  Few = 1,
  Many = 2,
}

/**
 * Get the pluralization state for a given count and locale.
 *
 * @param count - The number for which to determine the plural form.
 * @param locale - The current locale without region (e.g., 'sk', 'cs').
 * @returns The pluralization state (Singular, Few, Many).
 */
export function getPluralState(count: number, locale: string): PluralState {
  const rule = localePluralizationRules[locale];

  if (!rule) {
    // MARK: - Fallback: Default rule (Singular and Plural for unsupported locales)
    return count === 1 ? PluralState.Singular : PluralState.Many;
  }

  const choicesLength = 3;
  const category = rule(count, choicesLength);

  switch (category) {
    case 0:
      return PluralState.Singular;
    case 1:
      return PluralState.Few;
    case 2:
      return PluralState.Many;
    default:
      return PluralState.Singular;
  }
}
