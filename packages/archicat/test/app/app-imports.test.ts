import { afterAll, describe, expect, test } from 'vitest';

import {
  cleanupConsumerProjects,
  createApp,
  createConsumerProject,
  createLibrary,
  createModule,
} from '#test/fixtures/consumer-project';
import { runArchicatCommand } from '#test/fixtures/run-archicat-command';

describe('app imports', async () => {
  afterAll(() => {
    cleanupConsumerProjects();
  });

  test('should allow app composition root to import declared implementation targets', async () => {
    const root = createConsumerProject('app-imports-impl', {
      config: {
        librariesInclude: ['./src/libraries'],
        appsInclude: ['./src/apps'],
      },
    });

    createModule(root, {
      name: 'account',
      implIndex: `export const accountAssembly = {};`,
    });
    createLibrary(root, {
      name: 'postgresql',
      implIndex: `export const postgresqlAssembly = {};`,
    });
    createApp(root, {
      name: 'main-api',
      dependencies: ['module.account.impl', 'library.postgresql.impl'],
      index: `
        import { accountAssembly } from '#modules/account/impl/index.js';
        import { postgresqlAssembly } from '#library/postgresql/impl/index.js';
        export const assemblies = [accountAssembly, postgresqlAssembly];
      `,
    });

    expect((await runArchicatCommand(root, 'generate')).status).toBe(0);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status, result.stderr).toBe(0);
  });

  test('should allow implementation alias imports outside app roots when declared', async () => {
    const root = createConsumerProject('app-allows-declared-module-impl-import', {
      config: {
        appsInclude: ['./src/apps'],
      },
    });

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      implDependencies: ['module.account.impl'],
      implIndex: `
        import { accountImpl } from '#modules/account/impl/index.js';
        export const mediaImpl = accountImpl;
      `,
    });
    createApp(root, { name: 'main-api', dependencies: ['module.media.impl'] });

    expect((await runArchicatCommand(root, 'generate')).status).toBe(0);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status, result.stderr).toBe(0);
  });

  test('should reject implementation alias imports outside app roots when dependency is missing', async () => {
    const root = createConsumerProject('app-rejects-undeclared-module-impl-import', {
      config: {
        appsInclude: ['./src/apps'],
      },
    });

    createModule(root, { name: 'account' });
    createModule(root, {
      name: 'media',
      implIndex: `
        import { accountImpl } from '#modules/account/impl/index.js';
        export const mediaImpl = accountImpl;
      `,
    });
    createApp(root, { name: 'main-api', dependencies: ['module.account.impl'] });

    const generateResult = await runArchicatCommand(root, 'generate');

    expect(generateResult.status).not.toBe(0);
    expect(generateResult.stderr).toMatch(/imports "module\.account\.impl" but does not declare a dependency/);

    const result = await runArchicatCommand(root, 'validate');

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/imports "module\.account\.impl" but does not declare a dependency/);
  });
});
