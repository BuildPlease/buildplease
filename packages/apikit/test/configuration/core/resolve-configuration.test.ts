import { resolveConfiguration } from '@internal/configuration';
import { describe, expect, it } from 'vitest';

import type { BuildMetadata } from '@/configuration/core/build-metadata';
import { defineConfiguration } from '@/configuration/core/configuration';
import { defineEnvironments, resolveEnvironment } from '@/configuration/core/environments';
import { field } from '@/configuration/core/field';
import { defineSource } from '@/configuration/core/source';

describe('resolveConfiguration', () => {
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
      resolveConfiguration(
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
      resolveConfiguration(
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

  it('resolves computed sources from context', async () => {
    const Configuration = defineConfiguration('app.identity', {
      identifier: field.string(),
    });

    const buildMetadata: BuildMetadata = {
      name: {
        original: '@test/example-api',
        base: 'example-api',
      },
      version: '1.7.4',
      id: '019c0000-0000-7000-8000-000000000000',
      createdAt: '2026-07-28T21:15:42.381Z',
    };

    await expect(
      resolveConfiguration(
        Configuration,
        {
          identifier: from.compute(({ buildMetadata, environment }) => {
            return `${buildMetadata.name.original}:${environment.name}`;
          }),
        },
        {
          buildMetadata,
          environment,
        },
      ),
    ).resolves.toEqual({
      identifier: '@test/example-api:development',
    });
  });

  it('does not reuse mutable default values', async () => {
    const Configuration = defineConfiguration('app.defaults', {
      items: field.array(field.string()).default([]),
      nested: field.custom<{ readonly values: string[] }>().default({ values: [] }),
    });

    const first = await resolveConfiguration(Configuration, {}, { environment });
    const second = await resolveConfiguration(Configuration, {}, { environment });

    expect(first.items).not.toBe(second.items);
    expect(first.nested).not.toBe(second.nested);
    expect(first.nested.values).not.toBe(second.nested.values);
  });

  it('throws for missing required values', async () => {
    const Configuration = defineConfiguration('app.required', {
      token: field.string(),
    });

    await expect(resolveConfiguration(Configuration, from.static(undefined), { environment })).rejects.toThrow(
      'Missing required configuration: app.required.token',
    );
  });
});
