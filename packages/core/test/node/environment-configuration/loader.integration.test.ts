import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENVIRONMENT_CONFIG_FILE, loadConfig } from '@src-node/environment-configuration';
import { afterEach, describe, expect, it } from 'vitest';

const TEST_VARIABLE = 'BUILDPLEASE_LOADER_TEST';
const CONFIGURATION_MODULE = fileURLToPath(
  new URL('../../../src-node/environment-configuration/configuration.ts', import.meta.url),
);

describe('Environment Configuration loader integration', () => {
  let rootDir: string | undefined;

  afterEach(async () => {
    if (rootDir) await rm(rootDir, { recursive: true, force: true });
    rootDir = undefined;
    delete process.env[TEST_VARIABLE];
    delete process.env.NODE_ENV;
  });

  it('loads the real convention config and selected environment file', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    await writeFile(join(rootDir, ENVIRONMENT_CONFIG_FILE), makeConfigSource({ file: '.env.test' }), 'utf8');
    await writeFile(join(rootDir, '.env.test'), `${TEST_VARIABLE}=loaded\n`, 'utf8');

    const loaded = await loadConfig({ dir: rootDir, environment: 'test' });

    expect(basename(loaded.configFilePath)).toBe('environment.config.ts');
    expect(loaded.config.input).toEqual({ feature: 'example' });
    expect(loaded.environment.name).toBe('test');
    expect(loaded.environment.fileDir).toBe(rootDir);
    expect(process.env[TEST_VARIABLE]).toBe('loaded');
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('resolves environment fileDir relative to the actual config file', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));
    const configDir = join(rootDir, 'config');
    const environmentDir = join(configDir, 'environment');
    await mkdir(environmentDir, { recursive: true });
    await writeFile(
      join(configDir, 'custom.config.ts'),
      makeConfigSource({ file: '.env.test', fileDir: './environment' }),
      'utf8',
    );
    await writeFile(join(environmentDir, '.env.test'), `${TEST_VARIABLE}=nested\n`, 'utf8');

    const loaded = await loadConfig({
      dir: rootDir,
      config: './config/custom.config.ts',
      environment: 'test',
    });

    expect(dirname(loaded.configFilePath)).toBe(configDir);
    expect(loaded.environment.fileDir).toBe(environmentDir);
    expect(process.env[TEST_VARIABLE]).toBe('nested');
  });

  it('fails clearly when the convention config is missing', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'buildplease-environment-config-'));

    await expect(loadConfig({ dir: rootDir })).rejects.toThrow('Failed to load environment config: Config file');
  });
});

function makeConfigSource(environment: { readonly file: string; readonly fileDir?: string }): string {
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
