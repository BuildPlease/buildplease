import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { withSelectedEnvironment } from '@buildplease/core/test';
import { initializeApiKitConfiguration } from '@src-internal/configuration/initialize-configuration';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type TemporaryConfigurationProject,
  makeTemporaryConfigurationProject,
} from '#test/fixtures/configuration/temporary-config-project';

const BUILD = {
  name: {
    original: '@test/example-api',
    base: 'example-api',
  },
  version: '1.7.4',
  id: '019c0000-0000-7000-8000-000000000000',
  createdAt: '2026-07-29T14:00:00.000Z',
} as const;

const CONFIG_SOURCE = `
const identifier = {
  kind: 'compute',
  options: {
    compute: ({ build, environment }) => build.name.original + ':' + environment.name,
  },
  transforms: [],
};
Object.defineProperty(identifier, Symbol.for('buildplease.environment-configuration.source'), { value: true });

const config = {
  environments: {
    development: { file: '.env.development', alias: 'beta' },
  },
  input: {
    server: {
      identifier,
      host: '127.0.0.1',
      port: 30100,
    },
    configurations: [],
  },
};

Object.defineProperty(config, Symbol.for('buildplease.environment-configuration.config'), { value: true });

export default config;
`;

describe('ApiKit configuration integration', () => {
  let project: TemporaryConfigurationProject | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    await project?.cleanup();
    project = undefined;

    Reflect.deleteProperty(globalThis, 'apikit');
  });

  it('initializes ApiKit configuration from the selected BuildPlease environment', async () => {
    project = await makeTemporaryConfigurationProject();
    await writeProjectFiles(project);
    vi.spyOn(process, 'cwd').mockReturnValue(project.rootDir);
    await withSelectedEnvironment('development', async () => {
      await initializeApiKitConfiguration();

      expect(global.apikit.build).toEqual(BUILD);
      expect(global.apikit.environment.name).toBe('development');
      expect(global.apikit.environment.alias).toBe('beta');
      expect(global.apikit.serverConfig.identifier).toBe('@test/example-api:development');
    });
  });

  it('requires the prepared Core environment contract', async () => {
    project = await makeTemporaryConfigurationProject();
    await writeProjectFiles(project);
    await rm(join(project.rootDir, '.buildplease', 'environment.ts'));
    vi.spyOn(process, 'cwd').mockReturnValue(project.rootDir);

    await withSelectedEnvironment('development', async () => {
      await expect(initializeApiKitConfiguration()).rejects.toThrow('Prepared environment');
    });
  });

  it('requires the prepared Core build contract', async () => {
    project = await makeTemporaryConfigurationProject();
    await writeProjectFiles(project);
    await writeFile(join(project.rootDir, '.env.development'), 'APIKIT_LOAD_ORDER=environment-loaded\n', 'utf8');
    await rm(join(project.rootDir, '.buildplease', 'build.ts'));
    vi.spyOn(process, 'cwd').mockReturnValue(project.rootDir);
    delete process.env.APIKIT_LOAD_ORDER;

    try {
      await withSelectedEnvironment('development', async () => {
        await expect(initializeApiKitConfiguration()).rejects.toThrow('Prepared build');
      });

      expect(process.env.APIKIT_LOAD_ORDER).toBeUndefined();
    } finally {
      delete process.env.APIKIT_LOAD_ORDER;
    }
  });
});

async function writeProjectFiles(project: TemporaryConfigurationProject): Promise<void> {
  await project.writeConfig('environment.config.ts', CONFIG_SOURCE);
  await writeFile(join(project.rootDir, '.env.development'), '', 'utf8');

  const buildDir = join(project.rootDir, '.buildplease');
  await mkdir(buildDir, { recursive: true });
  await writeFile(join(buildDir, 'build.ts'), `export const Build = ${JSON.stringify(BUILD, null, 2)};\n`, 'utf8');
  await writeFile(
    join(buildDir, 'environment.ts'),
    "export enum Environment { development = 'development' }\n" +
      "export const Environments = { development: { name: Environment.development, alias: 'beta' } } as const;\n",
    'utf8',
  );
}
