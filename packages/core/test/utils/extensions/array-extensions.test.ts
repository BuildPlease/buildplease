import { describe, expect, it } from 'vitest';

import '@neutral/utils/extensions/array-extensions';

describe('Array extensions', () => {
  it('detects empty arrays', () => {
    expect([].isEmpty()).toBe(true);
    expect(['value'].isEmpty()).toBe(false);
  });
});
