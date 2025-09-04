import type { PluralizationRule } from 'vue-i18n';

const localePluralizationRules: Record<string, PluralizationRule> = {
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

const localeRegions: Record<string, string[]> = {
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

type PluralRulesOptions = {
  /*
   * Skip region-specific codes, use base language codes only
   */
  excludeRegions?: boolean;
  /*
   * Custom rules for specific codes
   */
  override?: Record<string, PluralizationRule>;
};

// Generate plural rules dynamically with options
export function definePluralRules(options: PluralRulesOptions = {}): Record<string, PluralizationRule> {
  const rules: Record<string, PluralizationRule> = {};

  Object.entries(localePluralizationRules).forEach(([code, rule]) => {
    // MARK: - Apply override if provided, otherwise use base rule
    rules[code] = options.override?.[code] || rule;

    // MARK: - Include region-specific rules if not excluded
    if (!options.excludeRegions && localeRegions[code]) {
      localeRegions[code].forEach((region) => {
        const regionCode = `${code}-${region}`;
        rules[regionCode] = options.override?.[regionCode] || rule;
      });
    }
  });

  return rules;
}
