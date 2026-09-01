import {
  defineConfiguration,
  defineCoreConfig,
  defineEnvironments,
  defineSource,
  field,
  resolveConfig,
  resolveConfiguration,
  resolveEnvironment,
} from '@src-node/environment-configuration';
import { afterEach, describe, expect, it } from 'vitest';

import type { Build } from '@/build';

const build: Build = {
  name: { original: '@test/example', base: 'example' },
  version: '1.0.0',
  id: '019c0000-0000-7000-8000-000000000000',
  createdAt: '2026-08-27T12:00:00.000Z',
};

const environments = defineEnvironments({
  test: { file: '.env.test' },
  production: { file: '.env.production' },
});
const from = defineSource(environments);
const environment = resolveEnvironment(environments, 'test');
const context = {
  build: build,
  environment: environment,
};

describe('Environment Configuration engine', () => {
  afterEach(() => {
    delete process.env.CONFIG_ENGINE_ORIGIN;
    delete process.env.CONFIG_ENGINE_PORT;
  });

  it('resolves a complete config tree with one required build context', async () => {
    const config = defineCoreConfig(environments, {
      origin: from.env('CONFIG_ENGINE_ORIGIN').default('http://localhost:30000'),
      port: from.env('CONFIG_ENGINE_PORT').default('30000').map(Number),
      mode: from.byEnvironment({ test: 'local', production: 'remote' }),
      identifier: from.compute(({ build: build, environment: current }) => {
        return `${build.name.original}:${current.name}`;
      }),
    });

    await expect(resolveConfig(config, context)).resolves.toEqual({
      origin: 'http://localhost:30000',
      port: 30_000,
      mode: 'local',
      identifier: '@test/example:test',
    });

    process.env.CONFIG_ENGINE_ORIGIN = ' https://api.example.com ';
    process.env.CONFIG_ENGINE_PORT = '30100';

    const resolved = await resolveConfig(config, context);
    expect(resolved.origin).toBe('https://api.example.com');
    expect(resolved.port).toBe(30_100);
  });

  it('preserves non-plain runtime values while resolving plain configuration objects', async () => {
    class Marker {
      public constructor(public readonly value: string) {}
    }

    const createdAt = new Date('2026-08-27T12:00:00.000Z');
    const api = new URL('https://api.example.com');
    const map = new Map([['key', 'value']]);
    const set = new Set(['value']);
    const pattern = /example/u;
    const marker = new Marker('value');
    const config = defineCoreConfig(environments, {
      nested: {
        mode: from.byEnvironment({ test: 'local', production: 'remote' }),
      },
      createdAt: createdAt,
      api: api,
      map: map,
      set: set,
      pattern: pattern,
      marker: marker,
    });

    const resolved = await resolveConfig(config, context);

    expect(resolved.nested.mode).toBe('local');
    expect(resolved.createdAt).toBe(createdAt);
    expect(resolved.api).toBe(api);
    expect(resolved.map).toBe(map);
    expect(resolved.set).toBe(set);
    expect(resolved.pattern).toBe(pattern);
    expect(resolved.marker).toBe(marker);
  });

  it('fails clearly for invalid runtime environment cases and missing root context', async () => {
    const config = defineCoreConfig(environments, {
      mode: from.byEnvironment({ test: 'test', production: 'production' }),
    });
    const invalidEnvironment = {
      name: 'staging',
    };

    await expect(
      resolveConfig(config, {
        build: build,
        environment: invalidEnvironment,
      } as never),
    ).rejects.toThrow('config.mode has no value for environment "staging".');

    await expect(resolveConfig(config, undefined as never)).rejects.toThrow('config requires runtime environment.');
    await expect(resolveConfig(config, { environment: environment } as never)).rejects.toThrow(
      'config requires build.',
    );
  });

  it('resolves reusable configurations without forcing root build context', async () => {
    const ServerConfiguration = defineConfiguration('example.server', {
      host: field.string(),
      port: field.number(),
      secure: field.boolean().default(false),
    });

    await expect(resolveConfiguration(ServerConfiguration, { host: ' localhost ', port: '30100' })).resolves.toEqual({
      host: 'localhost',
      port: 30_100,
      secure: false,
    });
  });
});
