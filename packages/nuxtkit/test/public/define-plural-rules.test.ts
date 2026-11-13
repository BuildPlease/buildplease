import { describe, expect, it } from 'vitest';

import { definePluralRules, getPluralState, PluralState } from '@/src/public/define-plural-rules';

describe('definePluralRules', () => {
  it('includes region rules by default', () => {
    const rules = definePluralRules();

    expect(rules.en).toBeDefined();
    expect(rules['en-US']).toBeDefined();
    expect(rules['sk-SK']).toBeDefined();
  });

  it('can exclude region rules', () => {
    const rules = definePluralRules({ excludeRegions: true });

    expect(rules.en).toBeDefined();
    expect(rules['en-US']).toBeUndefined();
  });

  it('resolves plural states', () => {
    expect(getPluralState(1, 'sk')).toBe(PluralState.Singular);
    expect(getPluralState(3, 'sk')).toBe(PluralState.Few);
    expect(getPluralState(5, 'sk')).toBe(PluralState.Many);
    expect(getPluralState(2, 'unknown')).toBe(PluralState.Many);
  });
});
