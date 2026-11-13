import '@neutral/utils/extensions/array-extensions';
import { describe, expect, it } from 'vitest';

describe('Array extensions', () => {
  it('detects empty arrays', () => {
    expect([].isEmpty()).toBe(true);
    expect(['value'].isEmpty()).toBe(false);
  });
});
