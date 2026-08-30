import { describe, expect, it } from 'vitest';

import * as WebKit from '@/index';

describe('WebKit public API', () => {
  it('does not expose framework assembly composition', () => {
    expect('webkitAssembly' in WebKit).toBe(false);
    expect('makeAssemblies' in WebKit).toBe(false);
  });
});
