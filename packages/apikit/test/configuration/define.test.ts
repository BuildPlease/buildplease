import { defineConfiguration, defineEnvironments, field } from '@buildplease/core/node';
import { describe, expect, it } from 'vitest';

import { defineApiKitConfig } from '@/configuration';

const environments = defineEnvironments({
  test: { file: '.env.test' },
});

const DatabaseConfiguration = defineConfiguration('example.database', {
  url: field.string(),
});

describe('defineApiKitConfig', () => {
  it('requires ApiKit configuration and keeps app-owned typed configurations', () => {
    const database = DatabaseConfiguration({
      url: 'postgres://localhost/example',
    });
    const config = defineApiKitConfig(environments, {
      server: {
        identifier: '@test/example-api:test',
        host: '127.0.0.1',
        port: 30000,
      },
      configurations: [database],
    });

    expect(config.input.configurations).toEqual([database]);
  });

  it('normalizes optional custom configurations', () => {
    const config = defineApiKitConfig(environments, {
      server: {
        identifier: '@test/example-api:test',
        host: '127.0.0.1',
        port: 30000,
      },
    });

    expect(config.input.configurations).toEqual([]);
  });

  it('keeps the ApiKit base contract typed', () => {
    // @ts-expect-error server is required by ApiKit.
    defineApiKitConfig(environments, {});
  });
});
