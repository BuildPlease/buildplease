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
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ file: '.env.test' }), 'utf8');
    await writeFile(join(rootDir, '.env.test'), `${TEST_VARIABLE}=loaded\n`, 'utf8');
    process.env.NODE_ENV = 'production';

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(basename(loaded.configFilePath)).toBe('environment.config.ts');
    expect(loaded.config.input).toEqual({ feature: 'example' });
    expect(loaded.environment.name).toBe('test');
    expect(loaded.environment.fileDir).toBe(rootDir);
    expect(process.env[TEST_VARIABLE]).toBe('loaded');
    expect(process.env.NODE_ENV).toBe('production');
  });

  it('keeps existing process environment values ahead of dotenv values', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ file: '.env.test' }), 'utf8');
    await writeFile(join(rootDir, '.env.test'), `${TEST_VARIABLE}=dotenv\n`, 'utf8');
    process.env[TEST_VARIABLE] = 'process';

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(process.env[TEST_VARIABLE]).toBe('process');
  });

  it('ignores a missing configured environment file', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ file: '.env.test' }), 'utf8');

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(loaded.environment.file).toBe('.env.test');
    expect(process.env[TEST_VARIABLE]).toBeUndefined();
  });

  it('supports environments without a dotenv file', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({}), 'utf8');

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(loaded.environment.file).toBeUndefined();
    expect(loaded.environment.fileDir).toBe(rootDir);
  });

  it('loads the environment selected by the BuildPlease execution context', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({ file: '.env.test' }), 'utf8');
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';

    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(loaded.environment.name).toBe('test');
  });

  it('validates the selected environment against the typed registry', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, 'environment.config.ts'), makeConfigSource({}), 'utf8');
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'production';

    await expect(loadSelectedEnvironmentConfig({ dir: rootDir })).rejects.toThrow(
      'Environment "production" is not defined.',
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
    await writeFile(join(environmentDir, '.env.test'), `${TEST_VARIABLE}=nested\n`, 'utf8');

    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'test';
    const loaded = await loadSelectedEnvironmentConfig({ dir: rootDir });

    expect(dirname(loaded.configFilePath)).toBe(rootDir);
    expect(loaded.environment.fileDir).toBe(environmentDir);
    expect(process.env[TEST_VARIABLE]).toBe('nested');
  });

  it('fails clearly when the convention config is missing', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));

    const error = await loadEnvironmentConfig({ dir: rootDir }).catch((error: unknown) => error);

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      message: expect.stringContaining('Failed to load environment config: Config file'),
      cause: expect.any(Error),
    });
  });
});

function makeConfigSource(environment: { readonly file?: string; readonly fileDir?: string }): string {
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
