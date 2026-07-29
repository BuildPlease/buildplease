import { makeBuildMetadata } from '@internal/generator/steps/generate-build-metadata';
import { PackageJSONSchema } from '@meawkit/core/node';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { buildId } = vi.hoisted(() => ({
  buildId: '019fab14-ff51-7075-a1ed-5669153f896c',
}));

vi.mock('uuid', () => ({
  v7: () => buildId,
}));

describe('makeBuildMetadata', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates build metadata from package metadata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-28T23:35:07.857Z'));

    const pkg = PackageJSONSchema.parse({
      name: '@test/example-api',
      version: '1.7.4',
    });

    expect(makeBuildMetadata(pkg)).toEqual({
      name: {
        original: '@test/example-api',
        base: 'example-api',
      },
      version: '1.7.4',
      id: buildId,
      createdAt: '2026-07-28T23:35:07.857Z',
    });
  });
});
