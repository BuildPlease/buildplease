import fs from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, test } from 'vitest';

import {
  cleanupConsumerProjects,
  createApp,
  createConsumerProject,
  createLibrary,
  createModule,
} from '#test/fixtures/consumer-project';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

describe('graph command', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should print the resolved graph without writing files', async () => {
    const root = createConsumerProject('graph-command', {
      config: {
        librariesInclude: ['./src/libraries'],
        appsInclude: ['./src/apps'],
      },
    });

    createLibrary(root, { name: 'backend' });
    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      dependencies: ['module.account.api', 'library.backend.api'],
    });
    createApp(root, { name: 'main-api', dependencies: ['module.media.impl', 'library.backend.impl'] });

    const result = await runArchicatCommand(root, 'graph');

    expect(result.status, result.stderr).toBe(0);
    expect(fs.existsSync(path.join(root, '.archicat'))).toBe(false);
  });
});
