import { describe, expect, it } from 'vitest';

describe('identity public API', () => {
  it('loads package entrypoint', async () => {
    const module = await import('@/index');

    expect(Object.keys(module)).not.toHaveLength(0);
  });
});
