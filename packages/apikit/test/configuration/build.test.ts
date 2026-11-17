import { resolveConfiguration } from '@src-internal/configuration/engine';
import { afterEach, describe, expect, it } from 'vitest';

import { defineEnvironments, defineSource } from '@/configuration';
import { BuildConfiguration } from '@/configuration/configs/build';

const from = defineSource(defineEnvironments({ test: {}, prod: {} }));

describe('ApiKit build identifier', () => {
  afterEach(() => {
    delete process.env.APP_RELEASE_TAG;
  });

  it('is optional in any environment and does not synthesize an identifier', async () => {
    await expect(resolveConfiguration(BuildConfiguration, { id: from.env('APP_RELEASE_TAG') })).resolves.toEqual({
      id: undefined,
    });
  });

  it('uses the explicitly selected source and trims its value', async () => {
    process.env.APP_RELEASE_TAG = ' deploy-123 ';

    await expect(resolveConfiguration(BuildConfiguration, { id: from.env('APP_RELEASE_TAG') })).resolves.toEqual({
      id: 'deploy-123',
    });
  });

  it('fails only when the developer explicitly requires the ID', async () => {
    await expect(
      resolveConfiguration(BuildConfiguration, { id: from.env('APP_RELEASE_TAG').required() }),
    ).rejects.toThrow('Missing required configuration: apikit.build.id');
  });
});
