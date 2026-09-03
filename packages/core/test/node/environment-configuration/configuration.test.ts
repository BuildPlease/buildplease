import {
  defineConfiguration,
  defineCoreConfig,
  defineEnvironments,
  defineSource,
  field,
  resolveEnvironment,
} from '@node/environment-configuration';
import { describe, expect, it } from 'vitest';

const environments = defineEnvironments({
  test: { file: ' .env.test ', alias: ' beta ' },
  production: { file: '.env.production' },
});

describe('Environment Configuration definitions', () => {
  it('defines environments and sources', () => {
    const from = defineSource(environments);
    const input = {
      origin: from.env('API_ORIGIN').default('http://localhost:30000'),
    };
    const config = defineCoreConfig(environments, input);

    expect(resolveEnvironment(environments, 'test')).toEqual({
      name: 'test',
      alias: 'beta',
    });
    expect(() => resolveEnvironment(environments, 'bug')).toThrow('Environment "bug" is not configured.');
    expect(config.environments).toBe(environments);
    expect(config.input).toBe(input);
  });

  it('supports environments without dotenv files', () => {
    const filelessEnvironments = defineEnvironments({
      test: {},
      production: {},
    });

    expect(resolveEnvironment(filelessEnvironments, 'test')).toEqual({
      name: 'test',
      alias: undefined,
    });
  });

  it.each(['test', 'production', 'staging', 'pre-production', 'local_dev'])(
    'accepts the canonical environment name %s',
    (name) => {
      const registry = { [name]: {} };

      expect(defineEnvironments(registry)).toBe(registry);
      expect(resolveEnvironment(registry, name)).toEqual({ name: name, alias: undefined });
    },
  );

  it.each(['', ' ', ' test', 'test ', ' test ', 'my test', 'production environment'])(
    'rejects the non-canonical environment name %j',
    (name) => {
      expect(() => defineEnvironments({ [name]: {} })).toThrow(
        'Environment name must be a non-empty string without whitespace.',
      );
    },
  );

  it('allows spaces in environment aliases', () => {
    const registry = defineEnvironments({ test: { alias: 'Beta Release' } });

    expect(resolveEnvironment(registry, 'test')).toEqual({ name: 'test', alias: 'Beta Release' });
  });

  it('validates malformed environment registries when defining config', () => {
    expect(() => defineCoreConfig({} as never, {})).toThrow('At least one environment must be defined.');
    expect(() => defineCoreConfig({ test: null } as never, {})).toThrow(
      'Environment definition must be an object for "test".',
    );
    expect(() => defineCoreConfig({ test: { fileDir: ' ' } } as never, {})).toThrow(
      'Environment file directory must not be empty for "test".',
    );
    expect(() => defineCoreConfig({ test: { alias: ' ' } } as never, {})).toThrow(
      'Environment alias must not be empty for "test".',
    );
  });

  it('does not resolve inherited registry properties as environments', () => {
    expect(() => resolveEnvironment(environments, 'toString')).toThrow('Environment "toString" is not configured.');
  });

  it('keeps Node source metadata out of the public environment identity', () => {
    const nestedEnvironments = defineEnvironments({
      test: { file: '.env.test', fileDir: './environment' },
    });

    expect(resolveEnvironment(nestedEnvironments, 'test')).toEqual({
      name: 'test',
      alias: undefined,
    });
  });

  it('defines reusable typed configurations', () => {
    const ServerConfiguration = defineConfiguration('example.server', {
      host: field.string(),
      port: field.number(),
      secure: field.boolean().default(false),
    });

    const binding = ServerConfiguration({ host: 'localhost', port: '30100' });

    expect(ServerConfiguration.key).toBe('example.server');
    expect(binding.contract).toBe(ServerConfiguration);
  });
});
