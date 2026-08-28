import { resolveConfiguration } from '@buildplease/core/node';
import { ApiKitDefaults } from '@src-internal/configuration';
import { describe, expect, it } from 'vitest';

import { CorsConfiguration } from '@/configuration';

describe('CorsConfiguration', () => {
  it('resolves ApiKit defaults', async () => {
    await expect(resolveConfiguration(CorsConfiguration, {})).resolves.toEqual({
      enabled: false,
      allowAllOrigins: false,
      includeWwwSubdomain: true,
      options: ApiKitDefaults.cors.options,
    });
  });

  it('merges consumer options over ApiKit defaults', async () => {
    await expect(
      resolveConfiguration(CorsConfiguration, {
        enabled: true,
        options: {
          origin: 'https://example.com',
          credentials: false,
        },
      }),
    ).resolves.toEqual({
      enabled: true,
      allowAllOrigins: false,
      includeWwwSubdomain: true,
      options: {
        ...ApiKitDefaults.cors.options,
        origin: 'https://example.com',
        credentials: false,
      },
    });
  });
});
