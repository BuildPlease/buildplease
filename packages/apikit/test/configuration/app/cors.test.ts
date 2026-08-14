import { resolveConfiguration } from '@internal/configuration';
import { ApiKitAppDefaults } from '@internal/configuration/app';
import { testEnvironment } from '@test/fixtures/configuration/environment';
import { describe, expect, it } from 'vitest';

import { CorsConfiguration } from '@/configuration/app';

describe('CorsConfiguration', () => {
  const environment = testEnvironment();

  it('keeps CORS disabled while resolving default options when omitted', async () => {
    await expect(resolveConfiguration(CorsConfiguration, {}, { environment: environment })).resolves.toEqual({
      enabled: false,
      allowAllOrigins: false,
      includeWwwSubdomain: true,
      options: ApiKitAppDefaults.cors.options,
    });
  });

  it('uses framework CORS options when enabled without consumer overrides', async () => {
    const resolved = await resolveConfiguration(CorsConfiguration, { enabled: true }, { environment: environment });

    expect(resolved.enabled).toBe(true);
    expect(resolved.options).toEqual(ApiKitAppDefaults.cors.options);
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
      ...ApiKitAppDefaults.cors.options,
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
      ...ApiKitAppDefaults.cors.options,
      credentials: false,
    });
  });
});
