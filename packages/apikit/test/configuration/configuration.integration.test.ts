import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { withSelectedEnvironment } from '@buildplease/core/test';
import { loadApiKitContext } from '@src-internal/configuration/load-context';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  type TemporaryConfigurationProject,
  makeTemporaryConfigurationProject,
} from '#test/fixtures/configuration/temporary-config-project';

const BUILD_METADATA = {
  name: {
    original: '@test/example-api',
    base: 'example-api',
  },
  version: '1.7.4',
  id: '019c0000-0000-7000-8000-000000000000',
  createdAt: '2026-07-29T14:00:00.000Z',
} as const;

const CONFIG_SOURCE = `
const config = {
  environments: {
    development: { file: '.env.development' },
  },
  input: {
    server: {
      identifier: '@test/example-api:development',
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

  it('creates the ApiKit runtime context from the selected BuildPlease environment', async () => {
    project = await makeTemporaryConfigurationProject();
    await writeProjectFiles(project);
    vi.spyOn(process, 'cwd').mockReturnValue(project.rootDir);
    await withSelectedEnvironment('development', async () => {
      await loadApiKitContext();

      expect(global.apikit.build).toEqual(BUILD_METADATA);
      expect(global.apikit.environmentConfig.name).toBe('development');
      expect(global.apikit.serverConfig.identifier).toBe('@test/example-api:development');
    });
  });
});

async function writeProjectFiles(project: TemporaryConfigurationProject): Promise<void> {
  await project.writeConfig('environment.config.ts', CONFIG_SOURCE);
  await writeFile(join(project.rootDir, '.env.development'), '', 'utf8');

  const buildDir = join(project.rootDir, '.apikit');
  await mkdir(buildDir, { recursive: true });
  await writeFile(
    join(buildDir, 'build-metadata.ts'),
    `export const BuildMetadata = ${JSON.stringify(BUILD_METADATA, null, 2)};\n`,
    'utf8',
  );
}
