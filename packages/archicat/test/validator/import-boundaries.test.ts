import { afterAll, describe, expect, test } from 'vitest';

import { cleanupConsumerProjects, createConsumerProject, createModule } from '#test/fixtures/consumer-project';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

describe('import boundary validator', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should reject cross-module source imports', async () => {
    const root = createConsumerProject('validator-cross-module-source-import');

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      implDependencies: ['module.account.api'],
      implIndex: `
        import { accountApi } from '../../account/api/index.js';
        export const mediaImpl = accountApi;
      `,
    });

    const generateResult = await runArchicatCommand(root, 'generate');

    expect(generateResult.status).not.toBe(0);
    expect(generateResult.stderr).toMatch(/imports Module "account"/);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/imports Module "account"/);
  });

  test('should reject same-definition cross-surface source imports', async () => {
    const root = createConsumerProject('validator-cross-surface-source-import');

    createModule(root, {
      name: 'account',
      implIndex: `
        import { accountApi } from '../api/index.js';
        export const accountImpl = accountApi;
      `,
    });

    const generateResult = await runArchicatCommand(root, 'generate');

    expect(generateResult.status).not.toBe(0);
    expect(generateResult.stderr).toMatch(/imports Module "account" api through a source path/);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/imports Module "account" api through a source path/);
  });
});
