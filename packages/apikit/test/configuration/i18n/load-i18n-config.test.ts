import { basename } from 'node:path';

import { loadI18nConfig } from '@internal/configuration';
import {
  type TemporaryConfigurationProject,
  makeTemporaryConfigurationProject,
} from '@test/fixtures/configuration/temporary-config-project';
import { afterEach, describe, expect, it } from 'vitest';

const CONFIG_SOURCE = `
export default {
  build: {
    outDir: '.apikit-i18n',
  },
  resources: {
    directories: [
      {
        path: './src/i18n/locales',
      },
    ],
  },
};
`;

describe('loadI18nConfig', () => {
  let project: TemporaryConfigurationProject | undefined;

  afterEach(async () => {
    await project?.cleanup();
    project = undefined;
  });

  it('loads the default i18n config', async () => {
    project = await makeTemporaryConfigurationProject();
    await project.writeConfig('apikit.i18n.config.ts', CONFIG_SOURCE);

    const result = await loadI18nConfig({ dir: project.rootDir });

    expect(result.rootDir).toBe(project.rootDir);
    expect(basename(result.configFilePath)).toBe('apikit.i18n.config.ts');
    expect(result.config.resources.directories).toEqual([
      {
        path: './src/i18n/locales',
      },
    ]);
  });
});
