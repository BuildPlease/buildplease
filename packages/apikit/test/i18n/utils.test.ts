import { describe, expect, it } from 'vitest';

import { normalizeLocale, splitBaseRegion } from '@/i18n/utils';

describe('i18n utils', () => {
  it('normalizes locale tags', () => {
    expect(normalizeLocale(' EN_us ')).toBe('en-us');
    expect(normalizeLocale()).toBe('');
  });

  it('splits base and region', () => {
    expect(splitBaseRegion('en-gb')).toEqual({ base: 'en', region: 'gb' });
    expect(splitBaseRegion('sk')).toEqual({ base: 'sk', region: undefined });
  });
});
