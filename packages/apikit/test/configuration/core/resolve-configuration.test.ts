import { describe, expect, it } from 'vitest';

import { defineConfiguration } from '@/configuration/core/configuration';
import { defineEnvironments, resolveEnvironment } from '@/configuration/core/environments';
import { field } from '@/configuration/core/field';
import { resolveConfigurationContract } from '@/configuration/core/resolve-configuration';
import { defineSource } from '@/configuration/core/source';

describe('resolveConfigurationContract', () => {
  const environments = defineEnvironments({
    development: { file: '.env.development' },
    production: { file: '.env.production' },
  });

  const from = defineSource(environments);
  const environment = resolveEnvironment(environments, 'development');

  it('resolves nested schemas and fields', async () => {
    const Configuration = defineConfiguration('app.server', {
      host: field.string(),
      port: field.number(),
      secure: field.boolean().default(false),
    });

    await expect(
      resolveConfigurationContract(
        Configuration,
        {
          host: 'localhost',
          port: '30100',
        },
        { environment },
      ),
    ).resolves.toEqual({
      host: 'localhost',
      port: 30_100,
      secure: false,
    });
  });

  it('resolves environment sources', async () => {
    const Configuration = defineConfiguration('app.edge', {
      origin: field.string(),
    });

    await expect(
      resolveConfigurationContract(
        Configuration,
        {
          origin: from.byEnvironment({
            development: 'http://localhost:3000',
            production: 'https://myssless.com',
          }),
        },
        { environment },
      ),
    ).resolves.toEqual({
      origin: 'http://localhost:3000',
    });
  });

  it('does not reuse mutable default values', async () => {
    const Configuration = defineConfiguration('app.defaults', {
      items: field.array(field.string()).default([]),
      nested: field.custom<{ readonly values: string[] }>().default({ values: [] }),
    });

    const first = await resolveConfigurationContract(Configuration, {}, { environment });
    const second = await resolveConfigurationContract(Configuration, {}, { environment });

    expect(first.items).not.toBe(second.items);
    expect(first.nested).not.toBe(second.nested);
    expect(first.nested.values).not.toBe(second.nested.values);
  });

  it('throws for missing required values', async () => {
    const Configuration = defineConfiguration('app.required', {
      token: field.string(),
    });

    await expect(resolveConfigurationContract(Configuration, from.static(undefined), { environment })).rejects.toThrow(
      'Missing required configuration: app.required.token',
    );
  });
});
