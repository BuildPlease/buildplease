import { describe, expect, it } from 'vitest';

import {
  capitalized,
  emptyOrUndefinedStringToNull,
  isNonEmptyString,
  isNullOrEmpty,
} from '@/utils/application/string-utils';

describe('string utils', () => {
  it('detects non-empty strings', () => {
    expect(isNonEmptyString(' value ')).toBe(true);
    expect(isNonEmptyString('   ')).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
  });

  it('detects null or empty values', () => {
    expect(isNullOrEmpty(null)).toBe(true);
    expect(isNullOrEmpty(undefined)).toBe(true);
    expect(isNullOrEmpty('   ')).toBe(true);
    expect(isNullOrEmpty('value')).toBe(false);
  });

  it('normalizes optional string values', () => {
    expect(emptyOrUndefinedStringToNull('')).toBeNull();
    expect(emptyOrUndefinedStringToNull(undefined)).toBeNull();
    expect(emptyOrUndefinedStringToNull('value')).toBe('value');
  });

  it('capitalizes non-empty strings', () => {
    expect(capitalized('sample')).toBe('Sample');
    expect(capitalized('')).toBeNull();
  });
});
