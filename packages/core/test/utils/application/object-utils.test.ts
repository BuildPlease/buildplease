import { filterObject, isEmptyObject, isNonEmptyObject, isPlainObject } from '@neutral/utils/application/object-utils';
import { describe, expect, it } from 'vitest';

describe('object utils', () => {
  it('filters nullish and empty nested values', () => {
    const value = filterObject(
      {
        name: 'Project',
        empty: '',
        missing: undefined,
        nested: {
          value: 'ok',
          emptyArray: [],
          emptyObject: {},
        },
      },
      {
        filterEmptyArray: true,
        filterEmptyObject: true,
        filterEmptyString: true,
      },
    );

    expect(value).toEqual({
      name: 'Project',
      nested: {
        value: 'ok',
      },
    });
  });

  it('detects empty, non-empty, and plain objects', () => {
    class Value {}

    expect(isEmptyObject({})).toBe(true);
    expect(isNonEmptyObject({ id: '1' })).toBe(true);
    expect(isPlainObject({ id: '1' })).toBe(true);
    expect(isPlainObject(new Value())).toBe(false);
  });
});
