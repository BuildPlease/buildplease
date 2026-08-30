import {
  defineConfig,
  defineConfiguration,
  defineEnvironments,
  defineSource,
  field,
  resolveEnvironment,
} from '@src-node/environment-configuration';
import { resolvePath } from '@src-node/file';
import { describe, expect, it } from 'vitest';

const environments = defineEnvironments({
  test: { file: ' .env.test ' },
  production: { file: '.env.production' },
});

describe('Environment Configuration definitions', () => {
  it('defines environments and sources', () => {
    const from = defineSource(environments);
    const input = {
      origin: from.env('API_ORIGIN').default('http://localhost:30000'),
    };
    const config = defineConfig(environments, input);

    expect(resolveEnvironment(environments, 'test', { baseDir: '/workspace' })).toEqual({
      name: 'test',
      file: '.env.test',
      fileDir: resolvePath('/workspace', '.'),
    });
    expect(() => resolveEnvironment(environments, 'bug')).toThrow('Environment "bug" is not defined.');
    expect(config.environments).toBe(environments);
    expect(config.input).toBe(input);
  });

  it('supports environments without dotenv files', () => {
    const filelessEnvironments = defineEnvironments({
      test: {},
      production: {},
    });

    expect(resolveEnvironment(filelessEnvironments, 'test', { baseDir: '/workspace' })).toEqual({
      name: 'test',
      file: undefined,
      fileDir: resolvePath('/workspace', '.'),
    });
  });

  it('validates malformed environment registries when defining config', () => {
    expect(() => defineConfig({} as never, {})).toThrow('At least one environment must be defined.');
    expect(() => defineConfig({ test: null } as never, {})).toThrow(
      'Environment definition must be an object for "test".',
    );
    expect(() => defineConfig({ test: { fileDir: ' ' } } as never, {})).toThrow(
      'Environment file directory must not be empty for "test".',
    );
  });

  it('does not resolve inherited registry properties as environments', () => {
    expect(() => resolveEnvironment(environments, 'toString')).toThrow('Environment "toString" is not defined.');
  });

  it('resolves environment directories relative to their configuration base', () => {
    const nestedEnvironments = defineEnvironments({
      test: { file: '.env.test', fileDir: './environment' },
    });

    expect(resolveEnvironment(nestedEnvironments, 'test', { baseDir: '/workspace/config' })).toEqual({
      name: 'test',
      file: '.env.test',
      fileDir: resolvePath('/workspace/config', './environment'),
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
