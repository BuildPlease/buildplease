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
import { runArchicatCli } from '#test/fixtures/run-archicat';

describe('generate command', () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should generate Archicat artifacts', () => {
    const root = createConsumerProject('cli-generate-output', {
      config: {
        librariesInclude: ['./src/libraries'],
        appsInclude: ['./src/apps'],
      },
    });

    createLibrary(root, { name: 'backend' });
    createModule(root, { name: 'account' });
    createModule(root, { name: 'media' });
    createApp(root, { name: 'main-api' });

    const result = runArchicatCli(root, 'generate');

    expect(result.status, result.stderr).toBe(0);
    expect(fs.existsSync(path.join(root, '.archicat/tsconfig.json'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.archicat/modules/account/api/index.ts'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.archicat/libraries/backend/api/index.ts'))).toBe(true);
    expect(fs.existsSync(path.join(root, '.archicat/reports/build.report.json'))).toBe(true);
  });
});
