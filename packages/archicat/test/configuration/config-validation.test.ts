import path from 'node:path';

import { afterAll, describe, expect, test } from 'vitest';

import { cleanupConsumerProjects, createConsumerProject, createModule } from '#test/fixtures/consumer-project';
import { writeFile } from '#test/fixtures/files';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

describe('configuration validation', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should reject malformed config sections', async () => {
    const root = createConsumerProject('invalid-config-section');

    createModule(root, { name: 'account' });
    writeFile(
      path.join(root, 'archicat.config.ts'),
      `
      export default {
        modules: 42,
      };
    `,
    );

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/config modules must be an object/);
  });

  test('should reject overlapping module and library alias roots', async () => {
    const root = createConsumerProject('alias-root-conflict', {
      config: {
        modulesAlias: '#domain',
        librariesAlias: '#domain/libraries',
      },
    });

    createModule(root, { name: 'account' });

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/module and library aliases must use separate roots/);
  });
});
