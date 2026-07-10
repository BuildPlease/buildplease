import { basename } from 'node:path';

import { appConfigTask, loadConfigForTask } from '@internal/configuration';
import {
  type TemporaryConfigurationProject,
  makeTemporaryConfigurationProject,
} from '@test/fixtures/configuration/temporary-config-project';
import { afterEach, describe, expect, it } from 'vitest';

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

describe('loadAppConfigForTask', () => {
  let project: TemporaryConfigurationProject | undefined;

  afterEach(async () => {
    await project?.cleanup();
    project = undefined;
  });

  it('loads the app config and returns resolved metadata', async () => {
    project = await makeTemporaryConfigurationProject();
    await project.writeConfig('apikit.app.config.ts', CONFIG_SOURCE);

    const result = await loadConfigForTask(appConfigTask, { dir: project.rootDir });

    expect(result.rootDir).toBe(project.rootDir);
    expect(basename(result.configFilePath)).toBe('apikit.app.config.ts');
    expect(result.config.environments).toEqual({
      development: { file: '.env.development' },
    });
  });

  it('loads an explicit config file name', async () => {
    project = await makeTemporaryConfigurationProject();
    await project.writeConfig('custom.config.ts', CONFIG_SOURCE);

    const result = await loadConfigForTask(appConfigTask, { dir: project.rootDir, config: 'custom.config.ts' });

    expect(result.config.server).toMatchObject({
      identifier: 'test',
      host: '127.0.0.1',
      port: 30_100,
    });
  });
});
