import '@neutral/utils/extensions/string-extensions';
import { describe, expect, it } from 'vitest';

describe('String extensions', () => {
  it('capitalizes strings', () => {
    expect('sample'.capitalized()).toBe('Sample');
    expect('   '.capitalized()).toBe('');
  });
});
