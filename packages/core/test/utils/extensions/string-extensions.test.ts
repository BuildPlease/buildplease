import { describe, expect, it } from 'vitest';

import '@/utils/extensions/string-extensions';

describe('String extensions', () => {
  it('capitalizes strings', () => {
    expect('meawkit'.capitalized()).toBe('Meawkit');
    expect('   '.capitalized()).toBe('');
  });
});
