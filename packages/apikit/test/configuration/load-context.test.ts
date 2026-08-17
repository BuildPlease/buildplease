import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type TemporaryConfigurationProject,
  makeTemporaryConfigurationProject,
} from '#test/fixtures/configuration/temporary-config-project';
import { loadApiKitContext } from '@/configuration/load-context';

const BUILD_METADATA = {
  name: {
    original: '@test/example-api',
    base: 'example-api',
  },
  version: '1.7.4',
  id: '019c0000-0000-7000-8000-000000000000',
  createdAt: '2026-07-29T14:00:00.000Z',
} as const;

describe('loadApiKitContext', () => {
  let project: TemporaryConfigurationProject | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    await project?.cleanup();
    project = undefined;

    Reflect.deleteProperty(globalThis, 'apikit');
    delete process.env.NODE_ENV;
  });

  it('loads generated build metadata without caller input', async () => {
    project = await makeTemporaryConfigurationProject();
    await writeProjectFiles(project);
    vi.spyOn(process, 'cwd').mockReturnValue(project.rootDir);

    await loadApiKitContext({
      environment: 'development',
    });

    expect(global.apikit.build).toEqual(BUILD_METADATA);
    expect(global.apikit.environmentConfig.name).toBe('development');
    expect(global.apikit.serverConfig.identifier).toBe('@test/example-api:development');
    expect(global.apikit.serverConfig.debug).toBe(false);
    expect(global.apikit.serverConfig.trustProxy).toBe(false);
    expect(global.apikit.notificationConfig).toEqual({ enabled: false });
  });

  it('loads an explicit config file', async () => {
    project = await makeTemporaryConfigurationProject();
    await writeProjectFiles(project, 'custom.config.ts');

    vi.spyOn(process, 'cwd').mockReturnValue(project.rootDir);

    await loadApiKitContext({
      environment: 'development',
      config: 'custom.config.ts',
    });

    expect(global.apikit.environmentConfig.name).toBe('development');
    expect(global.apikit.serverConfig.identifier).toBe('@test/example-api:development');
  });

  it('fails when generated build metadata is missing', async () => {
    project = await makeTemporaryConfigurationProject();
    await project.writeConfig('apikit.config.ts', makeConfigSource());
    await writeFile(join(project.rootDir, '.env.development'), '', 'utf8');
    vi.spyOn(process, 'cwd').mockReturnValue(project.rootDir);

    await expect(
      loadApiKitContext({
        environment: 'development',
      }),
    ).rejects.toThrow('Run "apikit build:app" first.');
  });
});

async function writeProjectFiles(
  project: TemporaryConfigurationProject,
  configName = 'apikit.config.ts',
): Promise<void> {
  await project.writeConfig(configName, makeConfigSource());
  await writeFile(join(project.rootDir, '.env.development'), '', 'utf8');

  const buildDir = join(project.rootDir, '.apikit');
  await mkdir(buildDir, { recursive: true });
  await writeFile(join(buildDir, 'build-metadata.ts'), makeBuildMetadataSource(), 'utf8');
}

function makeConfigSource(): string {
  return `
export default {
  environments: {
    development: {
      file: '.env.development',
    },
  },
  server: {
    identifier: '@test/example-api:development',
    host: '127.0.0.1',
    port: 30100,
  },
  configurations: [],
};
`;
}

function makeBuildMetadataSource(): string {
  return `
export const BuildMetadata = ${JSON.stringify(BUILD_METADATA, null, 2)};
`;
}
