import { basename } from 'node:path';

import { loadApiKitConfiguration, loadConfig } from '@internal/configuration/load-config';
import { afterEach, describe, expect, it } from 'vitest';

import { type TemporaryConfigProject, makeTemporaryConfigProject } from './fixtures';

const CONFIG_SOURCE = `
export default {
  environments: {
    development: { file: '.env.development' },
  },
  configurations: [],
  server: {
    identifier: 'test',
    host: '127.0.0.1',
    port: 30100,
  },
};
`;

describe('loadApiKitConfiguration', () => {
  let project: TemporaryConfigProject | undefined;

  afterEach(async () => {
    await project?.cleanup();
    project = undefined;
  });

  it('loads the default config and returns resolved metadata', async () => {
    project = await makeTemporaryConfigProject();
    await project.writeConfig('apikit.config.ts', CONFIG_SOURCE);

    const result = await loadApiKitConfiguration(project.rootDir);

    expect(result.rootDir).toBe(project.rootDir);
    expect(basename(result.configFilePath)).toBe('apikit.config.ts');
    expect(result.config.environments).toEqual({
      development: { file: '.env.development' },
    });
  });

  it('loads an explicit config file name', async () => {
    project = await makeTemporaryConfigProject();
    await project.writeConfig('custom.config.ts', CONFIG_SOURCE);

    const config = await loadConfig(project.rootDir, 'custom.config.ts');

    expect(config.server).toMatchObject({
      identifier: 'test',
      host: '127.0.0.1',
      port: 30_100,
    });
  });
});
