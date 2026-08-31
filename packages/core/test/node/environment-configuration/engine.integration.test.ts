import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BUILDPLEASE_ENVIRONMENT_VARIABLE } from '@src-internal/environment-configuration/selection';
import { loadEnvironmentConfig, loadSelectedEnvironmentConfig } from '@src-node/environment-configuration';
import { afterEach, describe, expect, it } from 'vitest';

const TEST_VARIABLE = 'BUILDPLEASE_LOADER_TEST';
const CONFIGURATION_MODULE = fileURLToPath(
  new URL('../../../src-node/environment-configuration/configuration.ts', import.meta.url),
);

describe('Environment Configuration engine integration', () => {
  let rootDir: string | undefined;

  afterEach(async () => {
    if (rootDir) await rm(rootDir, { recursive: true, force: true });
    rootDir = undefined;
    delete process.env[TEST_VARIABLE];
    delete process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];
    delete process.env.NODE_ENV;
  });

  it('loads the real convention config and selected environment file', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(
      join(rootDir, 'environment.config.ts'),
      makeConfigSource({ file: '.env.test', alias: 'beta' }),
      'utf8',
    );
    await writePreparedEnvironment(rootDir, { test: { alias: 'beta' } });
    await writeFile(join(rootDir, '.env.test'), `${TEST_VARIABLE}=loaded\n`, 'utf8');
    process.env.NODE_ENV = 'production';

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(basename(loaded.configFilePath)).toBe('environment.config.ts');
    expect(loaded.config.input).toEqual({ feature: 'example' });
    expect(loaded.environment.name).toBe('test');
    expect(loaded.environment.alias).toBe('beta');
    expect(loaded.environment).toEqual({ name: 'test', alias: 'beta' });
    expect(process.env[TEST_VARIABLE]).toBe('loaded');
    expect(process.env.NODE_ENV).toBe('production');
  });

  it('loads source configuration without selecting an environment or initializing dotenv', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ file: '.env.test' }), 'utf8');
    await writeFile(join(rootDir, '.env.test'), `${TEST_VARIABLE}=loaded\n`, 'utf8');

    const loaded = await loadEnvironmentConfig({ dir: rootDir });

    expect(loaded.config.input).toEqual({ feature: 'example' });
    expect(process.env[TEST_VARIABLE]).toBeUndefined();
  });

  it('keeps existing process environment values ahead of dotenv values', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ file: '.env.test' }), 'utf8');
    await writePreparedEnvironment(rootDir, { test: {} });
    await writeFile(join(rootDir, '.env.test'), `${TEST_VARIABLE}=dotenv\n`, 'utf8');
    process.env[TEST_VARIABLE] = 'process';

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(process.env[TEST_VARIABLE]).toBe('process');
  });

  it('ignores a missing configured environment file', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ file: '.env.test' }), 'utf8');
    await writePreparedEnvironment(rootDir, { test: {} });

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(loaded.environment).toEqual({ name: 'test', alias: undefined });
    expect(process.env[TEST_VARIABLE]).toBeUndefined();
  });

  it('supports environments without a dotenv file', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({}), 'utf8');
    await writePreparedEnvironment(rootDir, { test: {} });

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(loaded.environment).toEqual({ name: 'test', alias: undefined });
  });

  it('loads the environment selected by the BuildPlease execution context', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ file: '.env.test' }), 'utf8');
    await writePreparedEnvironment(rootDir, { test: {} });
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';

    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(loaded.environment.name).toBe('test');
  });

  it('rejects whitespace in prepared environment names', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({}), 'utf8');
    await writePreparedEnvironment(rootDir, { ' test ': {} });
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';

    await expect(loadSelectedEnvironmentConfig({ dir: rootDir })).rejects.toThrow('Prepared environment is invalid');
  });

  it('validates the selected environment against the typed registry', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({}), 'utf8');
    await writePreparedEnvironment(rootDir, { test: {} });
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'production';

    await expect(loadSelectedEnvironmentConfig({ dir: rootDir })).rejects.toThrow(
      'Environment "production" is not configured.',
    );
  });

  it('resolves environment fileDir relative to environment.config.ts', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    const environmentDir = join(rootDir, 'environment');
    await mkdir(environmentDir, { recursive: true });
    await writeFile(
      join(rootDir, 'environment.config.ts'),
      makeConfigSource({ file: '.env.test', fileDir: './environment' }),
      'utf8',
    );
    await writePreparedEnvironment(rootDir, { test: {} });
    await writeFile(join(environmentDir, '.env.test'), `${TEST_VARIABLE}=nested\n`, 'utf8');

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(dirname(loaded.configFilePath)).toBe(rootDir);
    expect(loaded.environment).toEqual({ name: 'test', alias: undefined });
    expect(process.env[TEST_VARIABLE]).toBe('nested');
  });

  it('fails clearly when the convention config is missing', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));

    const error = await loadEnvironmentConfig({ dir: rootDir }).catch((error: unknown) => error);

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      message: expect.stringContaining('Failed to load environment.config.ts: Config file'),
      cause: expect.any(Error),
    });
  });

  it('fails clearly when the prepared environment contract is missing', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({}), 'utf8');
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';

    await expect(loadSelectedEnvironmentConfig({ dir: rootDir })).rejects.toThrow('Prepared environment');
  });

  it('fails when the prepared environment contract is invalid', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({}), 'utf8');
    await mkdir(join(rootDir, '.buildplease'), { recursive: true });
    await writeFile(join(rootDir, '.buildplease', 'environment.ts'), 'export const Environments = {};\n', 'utf8');
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';

    await expect(loadSelectedEnvironmentConfig({ dir: rootDir })).rejects.toThrow('Prepared environment is invalid');
  });

  it('owns syntax failures as invalid prepared environments', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({}), 'utf8');
    await mkdir(join(rootDir, '.buildplease'), { recursive: true });
    await writeFile(join(rootDir, '.buildplease', 'environment.ts'), 'export const Environment = {', 'utf8');
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';

    await expect(loadSelectedEnvironmentConfig({ dir: rootDir })).rejects.toThrow('Prepared environment is invalid');
  });

  it('fails when the prepared environment registry is stale', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ alias: 'current' }), 'utf8');
    await writePreparedEnvironment(rootDir, { test: { alias: 'prepared' } });
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';

    await expect(loadSelectedEnvironmentConfig({ dir: rootDir })).rejects.toThrow(
      'Prepared environments do not match configured environments.',
    );
  });
});

function makeConfigSource(environment: {
  readonly alias?: string;
  readonly file?: string;
  readonly fileDir?: string;
}): string {
  return `
import { defineConfig } from ${JSON.stringify(CONFIGURATION_MODULE)};

const environments = {
  test: ${JSON.stringify(environment)},
};

export default defineConfig(environments, {
  feature: 'example',
});
`;
}

async function writePreparedEnvironment(
  rootDir: string,
  environments: Readonly<Record<string, { readonly alias?: string }>>,
): Promise<void> {
  await mkdir(join(rootDir, '.buildplease'), { recursive: true });
  const names = Object.keys(environments);
  const enumEntries = names.map((name) => `${JSON.stringify(name)}: ${JSON.stringify(name)}`).join(',');
  const registryEntries = names
    .map((name) => {
      const alias = environments[name]?.alias;
      const value = alias === undefined ? { name: name } : { name: name, alias: alias };

      return `${JSON.stringify(name)}: ${JSON.stringify(value)}`;
    })
    .join(',');

  await writeFile(
    join(rootDir, '.buildplease', 'environment.ts'),
    `export const Environment = {${enumEntries}};\nexport const Environments = {${registryEntries}};\n`,
    'utf8',
  );
}
