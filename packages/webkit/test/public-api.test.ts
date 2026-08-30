import * as WebKit from '@/index';
import { describe, expect, it } from 'vitest';

describe('WebKit public API', () => {
  it('does not expose framework assembly composition', () => {
    expect('webkitAssembly' in WebKit).toBe(false);
    expect('makeAssemblies' in WebKit).toBe(false);
  });
});
