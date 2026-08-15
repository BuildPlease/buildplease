import { ApiKitDefaults, resolveConfiguration } from '@internal/configuration';
import { testEnvironment } from '@test/fixtures/configuration/environment';
import { describe, expect, it } from 'vitest';

import { CorsConfiguration } from '@/configuration';

describe('CorsConfiguration', () => {
  const environment = testEnvironment();

  it('keeps CORS disabled while resolving default options when omitted', async () => {
    await expect(resolveConfiguration(CorsConfiguration, {}, { environment: environment })).resolves.toEqual({
      enabled: false,
      allowAllOrigins: false,
      includeWwwSubdomain: true,
      options: ApiKitDefaults.cors.options,
    });
  });

  it('uses framework CORS options when enabled without consumer overrides', async () => {
    const resolved = await resolveConfiguration(CorsConfiguration, { enabled: true }, { environment: environment });

    expect(resolved.enabled).toBe(true);
    expect(resolved.options).toEqual(ApiKitDefaults.cors.options);
  });

  it('shallow-merges consumer CORS option overrides over framework defaults', async () => {
    const origin = 'https://business.myssless.com';

    const resolved = await resolveConfiguration(
      CorsConfiguration,
      {
        enabled: true,
        options: {
          origin: origin,
        },
      },
      { environment: environment },
    );

    expect(resolved.options).toEqual({
      ...ApiKitDefaults.cors.options,
      origin: origin,
    });
  });

  it('allows consumer CORS options to override framework defaults explicitly', async () => {
    const resolved = await resolveConfiguration(
      CorsConfiguration,
      {
        enabled: true,
        options: {
          credentials: false,
        },
      },
      { environment: environment },
    );

    expect(resolved.options).toEqual({
      ...ApiKitDefaults.cors.options,
      credentials: false,
    });
  });
});
