import { describe, expect, it } from 'vitest';

import '@/utils/extensions/string-extensions';

describe('String extensions', () => {
  it('capitalizes strings', () => {
    expect('sample'.capitalized()).toBe('Sample');
    expect('   '.capitalized()).toBe('');
  });
});
