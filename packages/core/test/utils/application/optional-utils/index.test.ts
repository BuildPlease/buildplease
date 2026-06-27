import { describe, expect, it, vi } from 'vitest';

import { isDefinedAndNotNull, optional } from '@/utils/application/optional-utils';

describe('Optional', () => {
  it('maps present values', () => {
    expect(
      optional('meawkit')
        .map((value) => value.toUpperCase())
        .orThrow(),
    ).toBe('MEAWKIT');
  });

  it('uses defaults for missing values', () => {
    expect(optional<string>(null).orDefault('fallback')).toBe('fallback');
  });

  it('runs presence callbacks explicitly', () => {
    const present = vi.fn();
    const absent = vi.fn();

    optional('value').ifPresent(present).ifAbsent(absent);

    expect(present).toHaveBeenCalledWith('value');
    expect(absent).not.toHaveBeenCalled();
  });

  it('detects defined non-null values', () => {
    expect(isDefinedAndNotNull('value')).toBe(true);
    expect(isDefinedAndNotNull(null)).toBe(false);
    expect(isDefinedAndNotNull(undefined)).toBe(false);
  });
});
